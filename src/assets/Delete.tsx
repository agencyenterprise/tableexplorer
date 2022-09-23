const DeleteIcon = ({ width, height }: { width?: number; height?: number }) => {
  return (
    <svg width={width || 24} height={height || 24} viewBox="0 0 24 24">
      <path
        fill="#EF4444"
        d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z"
      />
    </svg>
  );
};

export default DeleteIcon;
