with open("decisions.txt") as f:
    for line in f:
        leadingspaces = len(line) - len(line.lstrip())
        print(leadingspaces)
