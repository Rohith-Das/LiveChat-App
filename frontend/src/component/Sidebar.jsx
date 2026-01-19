//  {/* Fixed message input */}
          
            
//               {showEmojiPicker && (
                
                  
                


//               )}
//               {filePreviewUrl && (
                
//                   {selectedFile?.name || 'Audio Recording'}
//                    clearSelectedFile()}
//                   className="btn btn-sm"
//                 >
//                   ✕
                
//                 {selectedFile?.type.startsWith('image/') && (
//                   <img src={filePreviewUrl} alt="Preview" className="max-h-32 rounded-md" />
//                 )}
//                 {selectedFile?.type.startsWith('video/') && (
//                   <video src={filePreviewUrl} className="max-h-32 rounded-md" controls />
//                 )}
//                 {selectedFile?.type.startsWith('audio/') && (
//                   <audio src={filePreviewUrl} className="max-h-16 rounded-md" controls />
//                 )}
              

            
              
                
//                   <label htmlFor="fileInput" className="cursor-pointer">
                    
                  
//                   <input
//                     type="file"
//                     id="fileInput"
//                     className="hidden"
//                     onChange={handleFileChange}
//                   />
                
                
                  
//                     {isRecording ? (
//                       <Microphone className="cursor-pointer text-red-500 animate-pulse" onClick={handleMicClick} />
//                     ) : (
//                       <Microphone className="cursor-pointer" onClick={handleMicClick} />
//                     )}
                  
                
                
                  
//                                  {
//                     setMessageInput(e.target.value);
//                     handleTyping();
//                   }}
//                   onBlur={handleStopTyping}
//                   placeholder="Type a message..."
//                   className="input input-bordered flex-1"
//                 /></label>