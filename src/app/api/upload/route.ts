import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export const maxDuration = 60; // Allow more time for upload if hosted on Vercel Pro/Hobby

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, filename } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Google Drive Folder ID from environment variables or fallback
    const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1Cu9ow1gfvylVMimrOyw6RNmxX-uwOqOp";

    // Prepare credentials
    // Note: private key in env vars might have escaped newlines
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: "Server missing Google Drive credentials" },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Process base64 image
    // format: data:image/png;base64,iVBORw0KGgoAAA...
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // OPTION 1: ImgBB Free Image Hosting (Highly Recommended & 100% Free)
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      try {
        console.log("Attempting ImgBB upload...");
        const formData = new FormData();
        formData.append("image", base64Data);

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData,
        });

        if (imgbbRes.ok) {
          const imgbbData = await imgbbRes.json();
          if (imgbbData.success && imgbbData.data?.url) {
            return NextResponse.json({
              success: true,
              url: imgbbData.data.url,
              fileId: "imgbb",
            });
          }
        }
        console.warn("ImgBB upload responded with error, falling back to other methods...");
      } catch (err: unknown) {
        console.error("ImgBB upload error:", err instanceof Error ? err.message : String(err));
      }
    }

    // OPTION 2: Google Drive
    // Create a stream from the buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Upload to drive
    const fileMetadata = {
      name: filename || `photobooth-${Date.now()}.png`,
      parents: [FOLDER_ID],
    };
    
    const media = {
      mimeType: "image/png",
      body: stream,
    };

    let response;
    try {
      response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      const fileId = response.data.id;
      if (!fileId) {
        throw new Error("Failed to get file ID after upload");
      }

      // Make the file publicly accessible
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      return NextResponse.json({
        success: true,
        url: response.data.webViewLink,
        fileId: fileId,
      });
    } catch (driveError: unknown) {
      const driveErrMsg = driveError instanceof Error ? driveError.message : String(driveError);
      console.warn("Google Drive upload failed, trying tmpfiles.org fallback...", driveErrMsg);
      
      // Fallback: Upload to catbox.moe (Free file host)
      try {
        const formData = new FormData();
        const fileBlob = new Blob([buffer], { type: "image/png" });
        formData.append("reqtype", "fileupload");
        formData.append("fileToUpload", fileBlob, filename || `photobooth-${Date.now()}.png`);

        const fallbackRes = await fetch("https://catbox.moe/user/api.php", {
          method: "POST",
          body: formData,
          headers: {
            // Some free hosts block requests without User-Agent
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (!fallbackRes.ok) {
          throw new Error(`Fallback upload responded with status ${fallbackRes.status}`);
        }

        const fallbackUrl = await fallbackRes.text();
        if (fallbackUrl && fallbackUrl.startsWith("http")) {
          return NextResponse.json({
            success: true,
            url: fallbackUrl.trim(),
            fileId: "fallback",
            isTemporary: false,
          });
        } else {
          throw new Error("Invalid response from fallback upload");
        }
      } catch (fallbackError: unknown) {
        console.error("Fallback upload also failed:", fallbackError);
        const fallbackErrMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        throw new Error(`Google Drive failed (${driveErrMsg}) and Fallback failed (${fallbackErrMsg})`);
      }
    }
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const errMsg = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
