import json
import pickle
import os

model_dir = os.getenv('MODEL_DIR', "/mnt/ml")

# Cache readers in memory to avoid downloading again
# Note that if using large number of models, you'll have to write an LRU cache as this map will overflow on memory.
model_cache = {}

def lambda_handler(event, context):

    # Reading the body to extract the model's name and the inputs 
    body = json.loads(event['body'])
    
    # Model's name
    name = body['name']

    # Input to make inference
    inputs = body['inputs']

    # Checking the cache
    if name not in model_cache:
        model_cache[name] = pickle.load(open(f'{model_dir}/{name}.sav', 'rb')) 
    
    response = model_cache[name].predict(inputs)
    
    # Function return 
    return {
        'statusCode': 200,
        'body': json.dumps(
            {
                "predicted_label": response.tolist(),
            }
        )
    }