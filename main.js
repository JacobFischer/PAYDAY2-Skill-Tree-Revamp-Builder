var payday = {
    points: 0,
};

var skillPointsPerTier = [
    0,
    4,
    10,
    18,
    9999,
];

function forEachSubtree(callback) {
    for(var i = 0; i < payday.trees.length; i++) {
        var tree = payday.trees[i];

        for(var j = 0; j < tree.trees.length; j++) { // subtrees for each "main" tree, e.g. Mastermind
            var subtree = tree.trees[j];

            callback(subtree, tree);
        }
    }
};

function forEachSkill(callback) {
    forEachSubtree(function(subtree, tree) {
        for(var t = subtree.tiers.length-1; t >= 0; t--) {
            var tier = subtree.tiers[t];
            tier.number = t;

            for(var s = 0; s < tier.length; s++) { // reverse order so we start at the top skill and go down for html elements
                var skill = tier[s];
                callback(skill, tier, subtree, tree);
            }
        }
    });
};

function updateHTML() {
    $("#points").html(payday.points);

    var subtree = payday.currentSubtree;
    for(var i = 0; i < subtree.tiers.length; i++) {
        var tier = subtree.tiers[i];
        for(var j = 0; j < tier.length; j++) {
            var skill = tier[j];

            skill.$skill.toggleClass("availible", Boolean(skill.availible));

            skill.$basic.toggleClass("taken", Boolean(skill.taken));
            skill.$aced
                .toggleClass("taken", skill.taken === "aced")
                .toggleClass("basic-needed", skill.availible && !skill.taken);

        }
    }
};

function calculatePoints() {
    payday.points = 0;
    forEachSubtree(function(subtree) {
        subtree.points = 0;
        subtree.pointsPerTier = [0, 0, 0, 0];
    })

    forEachSkill(function(skill, tier, subtree) {
        skill.availible = false;
        if(skill.taken) {
            var pts = 1 + tier.number;
            if(skill.taken === "aced") {
                pts += pts + 2;
            }

            for(var i = tier.number; i < 5; i++) {
                subtree.pointsPerTier[i] += pts;
            }
            subtree.points += pts;

            payday.points += pts;
        }
    });

    var recalculate = false;
    forEachSkill(function(skill, tier, subtree) {
        if(tier.number > 0) {
            var neededPointsInTier = skillPointsPerTier[tier.number];
            var pts = subtree.pointsPerTier[tier.number - 1];
            console.log("pts in ", skill.title, "is", pts)
            if(neededPointsInTier <= pts) {
                skill.availible = true;
            }
        }
        else {
            skill.availible = true;
        }

        if(!skill.availible) {
            if(skill.taken) {
                recalculate = true;
            }
            skill.taken = false;
        }
        else {
            console.log("skill", skill.title, "is availible")
        }
    });

    if(recalculate) {
        calculatePoints();
    }

    console.log("00000")

    updateHTML();
};

function buildTable() {
    var subtree = payday.currentSubtree

    payday.$tree
        .html("")
        .append($("<heading>" + subtree.title + "</heading>"));

    payday.$points = $("#points");

    var $table = $("<table>")
        .appendTo(payday.$tree);

    var maxSkillsInTier = 0;
    for(var i = 0; i < subtree.tiers.length; i++) {
        maxSkillsInTier = Math.max(maxSkillsInTier, subtree.tiers[i].length);
    }

    for(var t = subtree.tiers.length-1; t >= 0; t--) { // reverse order so we start at the top skill and go down for html elements
        var tier = subtree.tiers[t];
        var $tr = $("<tr>")
            .appendTo($table)
            .attr("id", "tier-" + t)
            .addClass("tier")
            .append($("<td>")
                .addClass("tier-number")
                .html(t)
            );

        var m = maxSkillsInTier;
        for(var s = 0; s < tier.length; s++) {

            var skill = tier[s];
            var $td = $("<td>")
                .appendTo($tr)

            m--;
            if(s === tier.length-1 && m !== 0) { // then span this last td
                $td.attr("colspan", 1 + m);
            }

            var $skill = $("<div>")
                .appendTo($td)
                .attr("id", "skill-" + t + "-" + s)
                .addClass("skill")
                .append($("<heading>")
                    .html(skill.title)
                );

            skill.$skill = $skill;

            for(var i = 0; i < 2; i++) {
                var type = i ? "aced" : "basic";
                var $part = $("<div>")
                    .appendTo($skill)
                    .addClass(type)
                    .append($("<div>")
                        .addClass("description")
                        .html(skill[type])
                    )
                    .append($("<div>")
                        .addClass("cost")
                        .html(1 + t + i*2)
                    );

                skill["$" + type] = $part;

                (function($part, skill, type) {
                    $part.on("click", function() {
                        if(skill.availible) {
                            if(!skill.taken) {
                                skill.taken = "basic";
                            }
                            else {
                                if(type === "aced") {
                                    if(skill.taken === "aced") {
                                        skill.taken = "basic";
                                    }
                                    else if(skill.taken === "basic") {
                                        skill.taken = "aced";
                                    }
                                }
                                else { // it's basic
                                    skill.taken = false;
                                }
                            }

                            calculatePoints();
                        }
                    });
                })($part, skill, type);
            }
        }
    }
}

function init() {
    var $trees = $("#trees");
    payday.currentSubtree = payday.trees[0].trees[0];

    forEachSkill(function(skill, tier, subtree, tree) {
        skill.tier = tier;
        skill.subtree = subtree;

        tier.subtree = subtree;
    });

    payday.$tree = $("#current-subtree");

    buildTable();

    calculatePoints();

};

$.ajax({
    dataType: "json",
    url: "trees.json",
    success: function(data) {
        payday.trees = data;

        $(document).ready(function() {
            init();
        });
    },
    error: function(data) {
        console.error(data);
    }
});

console.log("h");
