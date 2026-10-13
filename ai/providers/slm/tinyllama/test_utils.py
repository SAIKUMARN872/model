from ai.providers.slm.tinyllama.utils import (
    build_generation_kwargs,
    get_model,
    is_supported_model,
    normalize_model_id,
)


model = get_model("tinyllama-1.1b")

print("TINYLLAMA UTILS IMPORT: PASS")
print("MODEL:", model.id if model else None)
print("SUPPORTED:", is_supported_model("tinyllama-1.1b"))
print(
    "NORMALIZED:",
    normalize_model_id("tinyllama-1.1b"),
)
print(
    "GENERATION:",
    build_generation_kwargs(
        max_new_tokens=128,
        temperature=0.2,
        top_p=0.9,
    )
)

assert model is not None
assert model.id == "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
assert is_supported_model("tinyllama-1.1b")
assert (
    normalize_model_id("tinyllama-1.1b")
    == "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
)

generation = build_generation_kwargs(
    max_new_tokens=128,
    temperature=0.2,
    top_p=0.9,
)

assert generation == {
    "max_new_tokens": 128,
    "temperature": 0.2,
    "do_sample": True,
    "top_p": 0.9,
}

print("TINYLLAMA UTILS TEST: PASS")
