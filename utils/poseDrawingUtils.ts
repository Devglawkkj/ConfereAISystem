import { PoseLandmarkerResult, PoseLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

const drawConnectors = (
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    connections: [number, number][],
    options: { color: string; lineWidth: number }
) => {
    ctx.beginPath();
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.lineWidth;

    for (const connection of connections) {
        const start = landmarks[connection[0]];
        const end = landmarks[connection[1]];

        if (start && end) {
            ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
            ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
        }
    }
    ctx.stroke();
};

const drawLandmarks = (
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    options: { color: string; radius: number }
) => {
    ctx.fillStyle = options.color;
    for (const landmark of landmarks) {
        if (landmark) {
            ctx.beginPath();
            ctx.arc(
                landmark.x * ctx.canvas.width,
                landmark.y * ctx.canvas.height,
                options.radius,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }
};

export const drawOnCanvasForPose = (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    result: PoseLandmarkerResult
) => {
    const canvas = ctx.canvas;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flip for mirror effect
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // Draw video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Restore for drawing overlays
    ctx.restore();

    if (result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0];
        
        const mirroredLandmarks = landmarks.map(lm => ({
            ...lm,
            x: 1 - lm.x, // Flip x-coordinate for drawing
        }));

        // Draw connections (skeleton)
        const connections = PoseLandmarker.POSE_CONNECTIONS.map(
            (conn) => [conn.start, conn.end] as [number, number]
        );
        drawConnectors(ctx, mirroredLandmarks, connections, {
            color: '#00FF00', // Green color for the skeleton
            lineWidth: 2,
        });

        // Draw landmarks (joints)
        drawLandmarks(ctx, mirroredLandmarks, {
            color: '#FF0000', // Red color for the joints
            radius: 3,
        });
    }
};