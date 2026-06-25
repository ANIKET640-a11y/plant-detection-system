from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import math
from pathlib import Path

# Try to import tflite-runtime (standard on Render), fallback to tensorflow (for local development)
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    try:
        import tensorflow.lite as tflite
    except ImportError:
        import tensorflow as tf
        tflite = tf.lite

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load TFLite Model
interpreter = None
input_details = None
output_details = None

try:
    MODEL_PATH = Path(__file__).resolve().parent / "Plant_disease_model.tflite"
    interpreter = tflite.Interpreter(model_path=str(MODEL_PATH))
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("🚀 TFLite Model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load TFLite model: {e}")

CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy", 
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy", 
    "Tomato_Bacterial_spot", "Tomato_Early_blight", "Tomato_Late_blight", 
    "Tomato_Leaf_Mold", "Tomato_Septoria_leaf_spot", 
    "Tomato_Spider_mites_Two_spotted_spider_mite", "Tomato__Target_Spot", 
    "Tomato__Tomato_YellowLeaf__Curl_Virus", "Tomato__Tomato_mosaic_virus", 
    "Tomato_healthy"
]

def get_target_size():
    """Derive target size from model input shape."""
    if interpreter is None:
        return (224, 224), False
    input_shape = input_details[0]['shape']
    if len(input_shape) == 4:
        return (input_shape[1], input_shape[2]), False
    elif len(input_shape) == 2:
        flat_size = input_shape[1]
        channels = 3
        hw = int(math.sqrt(flat_size / channels))
        return (hw, hw), True
    else:
        return (224, 224), False

@app.get("/ping")
async def ping():
    return {
        "message": "Server is running",
        "model_loaded": interpreter is not None,
        "model_input_shape": str(input_details[0]['shape']) if interpreter else "N/A",
    }

def read_file_as_image(data: bytes) -> np.ndarray:
    target_size, is_flat = get_target_size()
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((target_size[1], target_size[0]))
    image = np.array(image, dtype=np.float32)
    if is_flat:
        image = image.flatten()
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if interpreter is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Check server logs.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        contents = await file.read()
        image = read_file_as_image(contents)
        img_batch = np.expand_dims(image, 0)

        # Run inference using TFLite Interpreter
        interpreter.set_tensor(input_details[0]['index'], img_batch)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])

        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))

        return {
            "class": predicted_class,
            "confidence": confidence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
