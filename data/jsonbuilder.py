"""
    convert spaces to tabs, from decisions.txt to decisionsTv.txt (tabs version)
    use python3 jsonbuilder.py > structure.json
    open structure.json and remove enclosing square brackets.
    also replace ' with "
    you're good to go!
"""

# with open("decisions.txt") as f:
#     for line in f:
#         leadingspaces = len(line) - len(line.lstrip())
#         print(leadingspaces)

f = open("decisionsTv.txt", "r")

depth = 0
root = {"name": "Black Mirror Bandersnatch", "children": []}
parents = []
node = root

for line in f:
    line = line.rstrip()
    newDepth = len(line) - len(line.lstrip("\t")) + 1
    # print(newDepth, line)
    # if the new depth is shallower than previous, we need to remove items from the list
    if newDepth < depth:
        parents = parents[:newDepth]
    # if the new depth is deeper, we need to add our previous node
    elif newDepth == depth + 1:
        parents.append(node)
    # levels skipped, not possible
    elif newDepth > depth + 1:
        raise Exception("Invalid file")
    depth = newDepth

    # create the new node
    line = line.split("->")

    try:
        node = {"name": line[0].strip(
        ), "description": line[1].strip(), "children": []}
    except:
        node = {"name": line[0].strip(), "children": []}

    # add the new node into its parent's children
    parents[-1]["children"].append(node)

f.close()

json_list = root["children"]
print(json_list)
