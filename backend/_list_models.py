import google.generativeai as genai
import traceback

genai.configure(api_key="AIzaSyA_GXbC5tLk9qR2kaDk7xu72Yb8se8VFOc")
print("package", genai.__file__)
try:
    models = list(genai.list_models())
    print("models count", len(models))
    for m in models[:30]:
        print(m.name, getattr(m, 'supported_generation_methods', None))
except Exception as e:
    traceback.print_exc()
