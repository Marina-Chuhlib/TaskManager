export const uploadPhotoToImgbb = async (photoUri: string) => {
	const apiKey = 'b3453ac237f0a3d24e11f6ac5146b031';
	const formData = new FormData();

	let type = 'image/jpeg';
	let name = 'upload.jpg';
	if (photoUri.toLowerCase().endsWith('.png')) {
		type = 'image/png';
		name = 'upload.png';
	}

	formData.append('image', {
		uri: photoUri,
		type,
		name,
	} as any);

	const response = await fetch(
		`https://api.imgbb.com/1/upload?key=${apiKey}`,
		{
			method: 'POST',
			body: formData,
		}
	);

	const data = await response.json();

	if (data.success) {
		return data.data.url;
	} else {
		throw new Error('Failed to upload image');
	}
};
