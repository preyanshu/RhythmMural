'use client';

import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Music, Lightbulb, AlertTriangle } from 'lucide-react';
import { submitMusic , getCurrentTheme } from '@/utils/contractUtils';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify'; 
import { generateMusic, generateMusicTheme, uploadToCloudinary } from '@/utils/musicgenUtils';

interface Track {
  prompt: string;
  blob: Blob;
}

const MusicGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [cloudAudioUrl, setCloudAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const { walletSdk } = useAuth();



  const queryMusic = async (data: { inputs: string }) => {
    setIsLoading(true);
    setElapsedTime(0);
  
    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);
  
    setTimerInterval(interval);
  
    try {
      const audioBlob = await generateMusic(data); // Call the separate function
  
      setTracks((prevTracks) => [
        ...prevTracks,
        { prompt: data.inputs, blob: audioBlob },
      ]);
    } catch (error) {

      toast.error('Failed to generate music.'); // Error toast for music generation
      console.error('Error generating music:', error);
    } finally {
      clearInterval(interval);
      setTimerInterval(null);
      setIsLoading(false);
    }
  };
  

  const handleSubmit = async () => {
    if (!selectedTrack) {
      toast.error('Please select a track to submit.'); // Error toast if no track is selected
      return;
    }
  
    setIsUploading(true);
  
    try {
      // Fetch the current theme from the contract
      const currentTheme = await getCurrentTheme(walletSdk);

      // let currentTheme = "";

      let themeToSubmit : any = currentTheme;

      // alert(JSON.stringify(currentTheme));
      // let currentTheme = "";
  
    
  
      // If the current theme is empty, generate a new theme
      if (!currentTheme || currentTheme!=="" ) {
        console.log('Generating new theme...');
        themeToSubmit = await generateMusicTheme(selectedTrack.prompt);
        console.log('Generated theme:', themeToSubmit);
      }
  
      // Upload audio to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(selectedTrack.blob);
      console.log('Uploaded to Cloudinary:', cloudinaryUrl);
  
      setCloudAudioUrl(cloudinaryUrl);
      setIsUploading(false);
      // Submit the music with the theme
      setIsSubmitting(true);
      
      const tx = await submitMusic(walletSdk, cloudinaryUrl, themeToSubmit, selectedTrack.prompt);
      

      setIsSubmitting(false);
      toast.success('Music submitted successfully!');
      // alert(JSON.stringify(tx));
    } catch (error) {
      setIsUploading(false);
      setIsSubmitting(false);
      toast.error('Failed to submit music.');
      console.error('Error submitting music:', error);
      
    }finally{
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };
  

  return (
    <div className="w-[100vw] max-w-[24rem]  min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-black via-gray-900 to-purple-950 text-gray-200">
      <div className="bg-gray-800 text-gray-300 shadow-xl rounded-xl p-8 max-w-xl w-full">
        <h1 className="text-xl font-extrabold mb-6 text-center text-purple-400 flex items-center justify-center">
          <Music className="w-8 h-8 mr-2 " />
          Submit Your Music Idea
        </h1>

        <p className="text-lg mb-6 text-center">
          Create your musical piece based on today's theme. Use your imagination to craft a prompt and let the AI generate something extraordinary
        </p>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          className="p-4 border border-gray-300 rounded-lg mb-4 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

<div className="flex justify-center space-x-4 mb-6">
  <button
    onClick={() => queryMusic({ inputs: prompt })}
    disabled={isLoading || !prompt}
    className={`px-6 py-1 rounded-lg text-white font-bold border-2 border-pink-500 ${
      isLoading
        ? 'bg-pink-400'
        : 'bg-pink-500 hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-500'
    } disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-pink-500`}
  >
    {isLoading ? (
      <Loader className="animate-spin w-5 h-5 mx-auto" />
    ) : (
      'Generate'
    )}
  </button>

  <button
    onClick={handleSubmit}
    disabled={isUploading || !selectedTrack || isSubmitting}
    className={`px-6 py-3 rounded-lg text-white font-bold border-2 border-purple-500 ${
      (isUploading || isSubmitting)
        ? 'bg-purple-400'
        : 'bg-purple-500 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500'
    } disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-purple-500`}
  >
    <div className="flex">
      {(isUploading || isSubmitting) && (
        <Loader className="animate-spin w-5 h-5 mx-auto mr-3" />
      )}
      {isUploading ? 'Uploading' : isSubmitting ? 'Submitting' : 'Submit (0.02 tBNB)'}
    </div>
  </button>
</div>


        {elapsedTime > 0 && (
          <div className={`text-center text-lg mt-4 ${elapsedTime > 60 ? 'text-red-600' : 'text-green-500'}`}>
            {elapsedTime > 60 && timerInterval ? (
              <p>It’s taking longer than expected. Try reducing your prompt.</p>
            ) : (
              <p>{timerInterval ? `Computing Time: ${elapsedTime}s` : `Time Taken: ${elapsedTime}s`}</p>
            )}
          </div>
        )}

        {tracks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Music className="w-6 h-6 mr-2 text-blue-500" />
              Generated Tracks
            </h2>
            {tracks.map((track, index) => (
              <div key={index} className="mb-4 p-2  border border-purple-800 rounded-lg flex flex-col items-start">
            
                  <p className="text-sm font-medium m-2 ">
                    <b className='text-purple-400'>Prompt: </b>
                    {track.prompt}
                  </p>
                  <audio controls className="w-full">
                    <source src={URL.createObjectURL(track.blob)} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
               
                <div className="w-full flex justify-end mt-3">
                  <button
                    onClick={() => {
                      setCloudAudioUrl(null);
                      setSelectedTrack(track);
                    }}
                    className={`px-4 py-2 rounded-lg font-bold ${
                      selectedTrack === track ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 text-gray-800'
                    }`}
                  >
                    {selectedTrack === track ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cloudAudioUrl && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">☁️ Uploaded Audio</h2>
            <a href={cloudAudioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              Click here to download the uploaded audio
            </a>
          </div>
        )}


    <div className="mt-8 text-center">
          <p className="text-yellow-600 font-bold flex items-center justify-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Avg Generation Time: ~40 seconds
          </p>
          <p className="text-red-500 font-medium mt-4 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Your progress will be lost if you change tabs.
          </p>
        </div>
      </div>

   <ToastContainer></ToastContainer>

    </div>
  );
};

export default MusicGenerator;
