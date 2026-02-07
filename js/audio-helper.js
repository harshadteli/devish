/**
 * Audio Utility Helper
 * Provides a simple way to play audio files from the audio folder.
 * Now returns a Promise that resolves when the audio finishes or fails.
 */
const AudioHelper = {
    play(filename) {
        return new Promise((resolve) => {
            try {
                const audio = new Audio(`audio/${filename}`);

                audio.onended = () => {
                    resolve({ success: true, ended: true });
                };

                audio.onerror = (err) => {
                    console.warn(`Audio playback error for ${filename}:`, err);
                    resolve({ success: false, error: err });
                };

                audio.play().catch(err => {
                    console.warn(`Audio play focus/policy restriction for ${filename}:`, err);
                    resolve({ success: false, error: err });
                });
            } catch (error) {
                console.error(`Error playing audio ${filename}:`, error);
                resolve({ success: false, error: error });
            }
        });
    }
};
