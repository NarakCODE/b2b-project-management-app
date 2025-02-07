//THE UPDATED ONE BECAUSE OF THE FILTERS ->  Take Note ->
export const transformOptions = (
  options: string[],
  iconMap?: Record<string, React.ComponentType<{ className?: string }>>
) =>
  options.map(value => ({
    label: value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()),
    value: value,
    icon: iconMap ? iconMap[value] : undefined,
  }));

export const transformStatusEnum = (status: string): string => {
  return status.replace(/_/g, ' ');
};

export const formatStatusToEnum = (status: string): string => {
  return status.toUpperCase().replace(/\s+/g, '_');
};

export const getAvatarColor = (initials: string): string => {
  const colors = [
    'bg-red-300 text-black',
    'bg-blue-300 text-black',
    'bg-green-300 text-black',
    'bg-yellow-300 text-black',
    'bg-purple-300 text-black',
    'bg-pink-300 text-black',
    'bg-teal-300 text-black',
    'bg-orange-300 text-black',
    'bg-muted text-black',
  ];

  // Simple hash to map initials to a color index
  const hash = initials
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
};

export const getAvatarFallbackText = (name: string) => {
  if (!name) return 'NA';
  const initials = name
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Ensure only two initials
  return initials || 'NA';
};
