// Armazenamento local para desenvolvimento usando Data URLs (imagens em texto).

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WebP.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'A imagem deve ter no máximo 5MB.'
  }
  return null
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Em um ambiente real, aqui nós faríamos compressão com Canvas.
// Para o mock, vamos apenas converter o arquivo em Base64 para salvar no LocalStorage.
export async function uploadImage(storeId, file, pathPrefix = 'products') {
  try {
    const validationError = validateImageFile(file)
    if (validationError) throw new Error(validationError)
    const base64Url = await fileToBase64(file)
    // O arquivo fica embutido no registro local enquanto o armazenamento remoto não é usado.
    return {
      url: base64Url,
      path: `stores/${storeId}/${pathPrefix}/${Math.random().toString(36).substr(2, 9)}_${file.name}`
    }
  } catch (error) {
    if (error.message) throw error
    throw new Error('Não foi possível processar a imagem')
  }
}

export async function uploadMultipleImages(storeId, files, pathPrefix = 'products') {
  const uploadPromises = files.map(file => uploadImage(storeId, file, pathPrefix))
  return Promise.all(uploadPromises)
}

export async function deleteImage() {
  // No mock local, como não armazenamos arquivos de verdade (já fica na string no LocalStorage),
  // não precisamos deletar nada fisicamente.
  return new Promise(resolve => setTimeout(resolve, 200))
}

export async function deleteMultipleImages() {
  return new Promise(resolve => setTimeout(resolve, 200))
}
