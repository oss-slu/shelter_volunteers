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

