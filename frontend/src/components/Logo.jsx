function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <img
      src="/mushroom-logo.svg"
      alt="Mushroom Hunter Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}

export default Logo;
