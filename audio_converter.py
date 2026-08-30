import os
import subprocess


def convert_to_wav(input_path):
    # Get the filename without its extension
    file_name = os.path.splitext(os.path.basename(input_path))[0]

    # Create the converted filename
    output_path = os.path.join(
        "audio",
        f"{file_name}_conv.wav"
    )

    # FFmpeg conversion command
    command = [
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        output_path
    ]

    # Run FFmpeg
    subprocess.run(
        command,
        check=True
    )

    return output_path