'use strict;';
var margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
},
    width = 600 - margin.right - margin.left,
    height = 400 - margin.top - margin.bottom;

var i = 0,
    duration = 500,
    root;

var tree = d3
    .layout
    .tree()
    .size([height, width]);

var diagonal = d3
    .svg
    .diagonal()
    .projection(function (d) {
        return [d.x, d.y];
    });

var svg = d3
    .select("#render")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("http://localhost:8000/structure.json", function (error, flare) {
    if (error)
        throw error;

    root = flare;

    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d
                ._children
                .forEach(collapse);
            d.children = null;
        }
    }

    root
        .children
        .forEach(collapse);
    update(root);
});

d3
    .select(self.frameElement)
    .style("height", "1080px");

function update(source) {

    var newHeight = Math.max(tree.nodes(root).reverse().length * 80, height);
    var newWidth = Math.max(tree.nodes(root).reverse().length * 80, width);

    d3
        .select("#render svg")
        .attr("width", newWidth + margin.right + margin.left)
        .attr("height", newHeight + margin.top + margin.bottom);

    tree = d3
        .layout
        .tree()
        .size([newHeight, width]);

    // Compute the new tree layout.
    var nodes = tree
        .nodes(root)
        .reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 80;
    });

    // Update the nodes…
    var node = svg
        .selectAll("g.node")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);

    nodeEnter
        .append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
            return d._children ?
                "lightsteelblue" :
                "#fff";
        });

    nodeEnter
        .append("text")
        .attr("x", -10)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function (d) {
            return d.name;
        })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    nodeUpdate
        .select("circle")
        .attr("r", 7.5)
        .style("fill", function (d) {
            return d._children ?
                "lightsteelblue" :
                "#fff";
        });

    nodeUpdate
        .select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.x + "," + source.y + ")";
        })
        .remove();

    nodeExit
        .select("circle")
        .attr("r", 1e-6);

    nodeExit
        .select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg
        .selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .text(function (d) {
            return d.children;
        });

    // Transition links to their new position.
    link
        .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
        if (typeof d.description != 'undefined') {
            alert(d.description);
        }
    }
    update(d);
}