// Audio processor worklet that calculates audio levels
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.lastUpdate = currentTime;
    this.updateInterval = 0.1; // Update every 100ms by default
    this.smoothingFactor = 0.8; // Default smoothing factor
    this.lastLevel = 0; // For smoothing
    this.isActive = false; // Track if audio is active
    this.silenceThreshold = -50; // dB threshold for silence detection
    this.silenceCounter = 0; // Count silence frames
    this.activityCounter = 0; // Count activity frames
    this.activityThreshold = 3; // Frames needed to consider active
  }

  handleMessage(event) {
    // Handle configuration messages from the main thread
    if (event.data) {
      if (typeof event.data.updateInterval !== 'undefined') {
        // Convert from ms to seconds for the processor
        this.updateInterval = event.data.updateInterval / 1000;
      }
      
      if (typeof event.data.smoothingFactor !== 'undefined') {
        this.smoothingFactor = event.data.smoothingFactor;
      }
      
      if (typeof event.data.silenceThreshold !== 'undefined') {
        this.silenceThreshold = event.data.silenceThreshold;
      }
    }
  }

  process(inputs, outputs) {
    const input = inputs[0];
    
    // If we have input data
    if (input && input.length > 0) {
      // Calculate audio level
      let sum = 0;
      let count = 0;
      
      for (let channel = 0; channel < input.length; channel++) {
        const inputChannel = input[channel];
        
        // Calculate RMS (Root Mean Square) value for this frame
        for (let i = 0; i < inputChannel.length; i++) {
          sum += inputChannel[i] * inputChannel[i]; // Square the sample
          count++;
        }
      }
      
      // Calculate RMS level and convert to dB
      if (count > 0) {
        const rms = Math.sqrt(sum / count);
        
        // Apply smoothing for more stable visualization
        const smoothedLevel = this.smoothingFactor * this.lastLevel + (1 - this.smoothingFactor) * rms;
        this.lastLevel = smoothedLevel;
        
        // Convert to dB (clamp minimum to -100dB)
        const db = smoothedLevel > 0 ? 20 * Math.log10(smoothedLevel) : -100;
        
        // Normalize to 0-100 range for easier use in UI
        // -60dB to 0dB is typical usable range for audio
        const normalizedLevel = Math.max(0, Math.min(100, (db + 60) / 60 * 100));
        
        // Determine if audio is active based on dB threshold
        if (db > this.silenceThreshold) {
          this.silenceCounter = 0;
          this.activityCounter++;
          if (this.activityCounter >= this.activityThreshold && !this.isActive) {
            this.isActive = true;
          }
        } else {
          this.activityCounter = 0;
          this.silenceCounter++;
          if (this.silenceCounter >= this.activityThreshold * 2 && this.isActive) {
            this.isActive = false;
          }
        }
        
        // Send audio level updates at specified interval
        if ((currentTime - this.lastUpdate) >= this.updateInterval) {
          // Send the audio level data to the main thread
          this.port.postMessage({ 
            audioLevel: Math.round(normalizedLevel), // Round to whole number
            db: Math.round(db * 10) / 10, // Round to 1 decimal place
            isActive: this.isActive // Add speaking state
          });
          
          this.lastUpdate = currentTime;
        }
      }
    }
    
    // Return true to keep the processor alive
    return true;
  }
}

// Register the processor
registerProcessor('audio-processor', AudioProcessor); 