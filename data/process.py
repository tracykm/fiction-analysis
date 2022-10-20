lyra_count = 0

with open("./raw_text/golden_compass.txt", encoding="utf-8") as f:
    for line in f:
        if "Lyra" in line:
            lyra_count += 1


print(lyra_count)
