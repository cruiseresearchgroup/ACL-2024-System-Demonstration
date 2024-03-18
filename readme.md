# ZzzGPT: An Interactive GPT Approach to Enhance Sleep Quality

This repository has the code for the demonstration submitted for _ACL 2024 System Demonstration_.

## Getting Started
Follow these steps to set up and run the application:


1. Set up the environment and Install Dependencies:


```
conda create --name chatbot python=3.8.8
conda activate chatbot
pip install -r requirements.txt 
conda install -c conda-forge catboost
```

2. Set Environment Variables:
   
Create a file named api.env in your project root directory and add the following line:

```OPENAI_API_KEY='your_openai_api_key_here'```

3. Run Flask: 

To be able to serve the requests coming from the javascript code, you need to configure and run flask server (change the port if needed).

For Mac:


```
export FLASK_APP=flask_server.py
flask run --port 3000
```

For Windows: 
```
set FLASK_APP=flask_server.py
flask run --port 3000
```


