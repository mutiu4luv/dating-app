export const cloudinaryImage = (
  url,
  { width = 900, height, crop = "limit", quality = "auto:best" } = {}
) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url || "";
  }

  const transforms = [`f_auto`, `q_${quality}`, `c_${crop}`, `w_${width}`];
  if (height) transforms.push(`h_${height}`);
  if (crop === "fill") transforms.push("g_face");

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
};
