import { FaceLandmarkerResult, FaceLandmarker } from '@mediapipe/tasks-vision';

export type DrawStatus = 'detecting' | 'recognized' | 'unrecognized' | 'demo';

const STATUS_COLORS: { [key in DrawStatus]: string } = {
    detecting: '#3b82f6', // blue-500
    recognized: '#22c55e', // green-500
    unrecognized: '#ef4444', // red-500
    demo: '#a855f7',      // purple-500
};

/**
 * Draws connectors between facial landmarks on a canvas.
 * This function is self-contained and does not rely on external drawing utilities.
 */
const drawConnectors = (
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; z: number }[],
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


export const drawOnCanvas = (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    result: FaceLandmarkerResult,
    status: DrawStatus
) => {
    const canvas = ctx.canvas;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flip the context horizontally to create the mirror effect for the video
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Restore the context to its original state (unflipped) to draw overlays correctly
    ctx.restore();

    // Now draw landmarks and box on the unflipped canvas, but transform coordinates to match the visual flip
    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0];
        
        // Create a mirrored version of landmarks for drawing, as the user sees a mirrored image.
        const mirroredLandmarks = landmarks.map(lm => ({
            ...lm,
            x: 1 - lm.x, // Flip x-coordinate
        }));

        // Draw mesh (tesselation) - The "wow" factor
        drawConnectors(ctx, mirroredLandmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION as [number, number][], {
            color: '#C0C0C070', // A semi-transparent silver color
            lineWidth: 0.5,
        });

        // Calculate bounding box from original (unflipped) landmarks to get correct dimensions
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const landmark of landmarks) {
            minX = Math.min(minX, landmark.x);
            maxX = Math.max(maxX, landmark.x);
            minY = Math.min(minY, landmark.y);
            maxY = Math.max(maxY, landmark.y);
        }

        // Convert normalized coordinates to canvas coordinates for drawing the box
        const boxWidth = (maxX - minX) * canvas.width;
        const boxHeight = (maxY - minY) * canvas.height;
        // The top-left corner x needs to be calculated for the mirrored view
        const mirroredX = (1 - maxX) * canvas.width;
        const y = minY * canvas.height;

        ctx.strokeStyle = STATUS_COLORS[status];
        ctx.lineWidth = 4;
        ctx.strokeRect(mirroredX, y, boxWidth, boxHeight);
    }
};
