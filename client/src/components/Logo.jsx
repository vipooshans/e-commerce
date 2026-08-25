const Logo = ({ height, className = '', alt = 'EverBuy Global' }) => (
  <img
    src="/logo.svg"
    alt={alt}
    className={className}
    style={{
      ...(height != null ? { height: typeof height === 'number' ? `${height}px` : height } : null),
      width: 'auto',
      display: 'block',
      objectFit: 'contain',
    }}
  />
);

export default Logo;
