import React, { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
  fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  style,
  fallbackSrc = "/images/placeholder.jpg",
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Если изображение не является Next.js оптимизированным или возникла ошибка с доменом,
  // используем обычный img тег
  if (hasError && imgSrc === fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        style={style}
        onError={(e) => {
          // Последний fallback - показываем placeholder
          e.currentTarget.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
        }}
      />
    );
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    priority,
    onError: handleError,
    style,
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return <Image {...imageProps} width={width || 400} height={height || 300} />;
};

export default SafeImage;
