ALTER TABLE "assets"
ADD CONSTRAINT "assets_expected_size_range"
CHECK ("expected_size" BETWEEN 1 AND 26214400);

ALTER TABLE "assets"
ADD CONSTRAINT "assets_stored_size_positive"
CHECK ("stored_size" IS NULL OR "stored_size" > 0);

ALTER TABLE "assets"
ADD CONSTRAINT "assets_media_type_supported"
CHECK ("media_type" IN ('image/jpeg', 'image/png'));

ALTER TABLE "assets"
ADD CONSTRAINT "assets_pixel_dimensions_pair"
CHECK (
  ("pixel_width" IS NULL AND "pixel_height" IS NULL)
  OR
  ("pixel_width" > 0 AND "pixel_height" > 0)
);
