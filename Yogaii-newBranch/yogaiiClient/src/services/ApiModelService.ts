

export interface PredictionResult {
  className: string;
  probability: number;
  allPredictions: { className: string; probability: number }[];
}

class ApiModelService {
  async predictPose(imageData: HTMLCanvasElement): Promise<PredictionResult> {
    try {
      const base64Image = imageData.toDataURL('image/jpeg');
      
        const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image // Send the full base64 string including the prefix
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error('API çağrısında hata oluştu');
      }

      const data = await response.json();
      console.log('API Response:', data);
      // Map the response to the expected format
      return {
        className: data.pose, // Backend sends 'pose', not 'predicted_class'
        probability: data.confidence,
        allPredictions: Object.entries(data.all_probabilities).map(([className, probability]) => ({
          className,
          probability: probability as number
        }))
      };
    } catch (error) {
        debugger;
      console.error('API Error:', error);
      throw new Error('Yoga pozu tahmini yapılamadı');
    }
  }
}

export default new ApiModelService();