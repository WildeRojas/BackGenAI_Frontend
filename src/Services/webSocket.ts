
let currentSocket: WebSocket | null = null;

export function connectWebSocket(path: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/projects/${path}/`);
        currentSocket = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
            resolve(socket);
        };

        socket.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            currentSocket = null;
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };
    });
}

export function sendMessage(message: object) {
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
        currentSocket.send(JSON.stringify(message));
    } else {
        console.warn('WebSocket is not connected', console.error());
    }
}

export function disconnectWebSocket() {
    if (currentSocket) {
        currentSocket.close();
        currentSocket = null;
    }
}