import { GoogleGenerativeAI } from "@google/generative-ai";

// Upload audio to Cloudinary
export const uploadToCloudinary = async (audioBlob: Blob): Promise<string> => {
  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL as string;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

  if (!cloudinaryUrl || !uploadPreset) {
    throw new Error('Missing Cloudinary configuration in environment variables');
  }

  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('upload_preset', uploadPreset);

  console.log(audioBlob.type);

  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload audio to Cloudinary');
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading audio to Cloudinary:', error);
    throw error;
  }
};

// Generate music theme using Google Generative AI
export const generateMusicTheme = async (prompt: string): Promise<string | null> => {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string;

  if (!googleApiKey) {
    throw new Error('Missing Google API key in environment variables');
  }

  try {
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const formattedPrompt = `"Generate a creative and evocative one to two word theme for the following description: '${prompt}'. 
    The theme should evoke strong emotions, imagery, or moods, and align with the vibe of music creation. 
    Use laymen's words. strictly return only one theme."`;

    const result = await model.generateContent(formattedPrompt);
    console.log("Generated music theme:", result.response.text());
    return result.response.text();
  } catch (error) {
    console.error("Error generating music theme:", error);
    return null;
  }
};

// Generate music using Hugging Face API
export const generateMusic = async (data: { inputs: string }) => {
  const hfApiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY as string;

  if (!hfApiKey) {
    throw new Error('Missing Hugging Face API key in environment variables');
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/musicgen-small',
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
   

    console.log(response , "response");

    if (!response.ok) {
      throw new Error('Failed to fetch music');
    }



    const audioBlob = await response.blob(); // The actual audio blob
    return audioBlob; // Return the audio blob to the calling function
  } catch (error) {
    console.error('Error fetching music:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
