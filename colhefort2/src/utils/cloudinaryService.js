// Configuração do Cloudinary
const CLOUD_NAME = 'qm3rvgks';
const UPLOAD_PRESET = 'colhefort_uploads'; // Configure um upload preset não assinado no Cloudinary

/**
 * Faz upload de um arquivo para o Cloudinary usando upload preset
 * @param {string} fileUri - URI do arquivo local
 * @param {string} folder - Pasta no Cloudinary (opcional)
 * @param {string} resourceType - Tipo de recurso (image, raw para PDFs)
 * @returns {Promise<Object>} - Resultado do upload
 */
export const uploadToCloudinary = async (fileUri, folder = 'samples/ecommerce', resourceType = 'image') => {
  try {
    const formData = new FormData();
    
    // No web, precisamos converter o URI em um Blob
    if (typeof window !== 'undefined' && window.location) {
      // Web environment
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('file', blob);
    } else {
      // React Native environment
      formData.append('file', {
        uri: fileUri,
        type: resourceType === 'image' ? 'image/jpeg' : 'application/pdf',
        name: `upload.${resourceType === 'image' ? 'jpg' : 'pdf'}`,
      });
    }
    
    // Adicionar upload preset (não assinado)
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    
    const cloudResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await cloudResponse.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    throw error;
  }
};

/**
 * Gera URL otimizada para entrega
 * @param {string} publicId - ID público do arquivo
 * @param {Object} options - Opções de transformação
 * @returns {string} - URL otimizada
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  const params = new URLSearchParams({
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
  return `${baseUrl}/${publicId}?${params.toString()}`;
};

