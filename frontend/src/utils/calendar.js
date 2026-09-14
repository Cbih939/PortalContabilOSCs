export const downloadICS = (title, description, location) => {
  // Use today's date but set it to the 10th for the start
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dateStr = `${year}${month}10T090000`;
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Portal Contabil OSCs//PT
BEGIN:VEVENT
UID:${new Date().getTime()}@portalcontabiloscs.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;TZID=America/Sao_Paulo:${dateStr}
RRULE:FREQ=MONTHLY;BYMONTHDAY=10
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
