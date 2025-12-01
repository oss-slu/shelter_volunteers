export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(
        [], 
        {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true 
        });
}

export const formatTime24 = (date) => {
    return new Date(date).toLocaleTimeString(
        [], 
        {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
        });
}

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export const displayTime = (millisecondsSinceMidnight, is24HourFormat = false) => {
    const today = new Date();
    // Reset to midnight
    today.setHours(0, 0, 0, 0);
    
    // Add the milliseconds since midnight
    const dateWithTime = new Date(today.getTime() + millisecondsSinceMidnight);
    if (is24HourFormat) {
        return formatTime24(dateWithTime);
    }
    return formatTime(dateWithTime);
}

export const timeStringToMillis = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours * 60 + minutes) * 60 * 1000;
};

// Convert timestamp to HH:mm format for time input
export const timestampToTimeInput = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Convert HH:mm time string back to timestamp, preserving the date from original timestamp
export const timeInputToTimestamp = (timeStr, originalTimestamp) => {
  if (!timeStr || !originalTimestamp) return originalTimestamp;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const originalDate = new Date(originalTimestamp);
  originalDate.setHours(hours, minutes, 0, 0);
  return originalDate.getTime();
};

export const millisToTimeString = (millis) => {
  const hours = Math.floor(millis / (60 * 60 * 1000));
  const minutes = Math.floor((millis % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

