export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(
        [], 
        {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true 
        });
}

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}


