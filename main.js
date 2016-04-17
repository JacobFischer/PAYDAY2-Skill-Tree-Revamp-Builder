// The main script that does the heavy lifting.
// Don't judge this code too harshly. I threw it all together in a few hours.
// - Jacob Fischer

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

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

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

            for(var s = 0; s < tier.length; s++) { // reverse order so we start at the top skill and go down for html elements
                var skill = tier[s];
                callback(skill, tier, subtree, tree);
            }
        }
    });
};

function updateHTML() {
    payday.$points
        .toggleClass("maxed", payday.points >= 100)
        .html(payday.points);

    payday.$pointsMessage
        .removeClass("error warning")
        .html("");


    if(payday.points >= 105) {
        payday.$pointsMessage
            .addClass("error")
            .html("Invalid!");
    }
    else if(payday.points > 100 && payday.points < 105) {
        payday.$pointsMessage
            .addClass("warning")
            .html("Requires Infamy");
    }

    var subtreesForName = [];
    forEachSubtree(function(subtree) {
        $(".subtree-" + subtree.number + "-points").html(subtree.points);
        subtreesForName.push(subtree);
    });

    // create build name
    subtreesForName.sort(function(a, b) {
        if(a.points !== b.points) {
            return b.points - a.points;
        }

        return a.number - b.number;
    });

    while(true) {
        var last = subtreesForName[subtreesForName.length - 1];

        if(last && last.points === 0) {
            subtreesForName.pop();
        }
        else {
            break;
        }
    }

    var count = Math.min(subtreesForName.length, 3); // at most 3 elements to make the name
    var generatedName = [];
    for(var i = 0; i < count; i++) {
        generatedName.unshift(subtreesForName[i][i === 0 ? "noun" : "adjective"])
    }
    payday.generatedName = generatedName.length === 0 ? "New Build" : generatedName.join(" ");
    payday.$buildName.val(getUrlParameter("name") || payday.generatedName);

    forEachSubtree(function(subtree) {
        for(var i = 0; i < subtree.tiers.length; i++) {
            var tier = subtree.tiers[i];
            for(var j = 0; j < tier.length; j++) {
                var skill = tier[j];

                var $skill = $(".skill-" + skill.number)
                    .toggleClass("availible", Boolean(skill.availible))
                    .removeClass("taken-basic taken-aced");

                if(skill.taken) {
                    $skill.addClass("taken-" + skill.taken);
                }

                if(payday.currentSubtree === subtree) {
                    skill.$basic.toggleClass("taken", Boolean(skill.taken));
                    skill.$aced
                        .toggleClass("taken", skill.taken === "aced")
                        .toggleClass("basic-needed", skill.availible && !skill.taken);
                }
            }
        }
    });
};

function updateURL() {
	var values = {};
	forEachSkill(function(skill) {
		values[skill.number] = (skill.taken ? skill.taken[0].toLowerCase() : undefined);
	});

	queryString.setAll(values);
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
    });

    if(recalculate) {
        calculatePoints();
    }

    updateURL();
    updateHTML();
};

function buildTable() {
    var subtree = payday.currentSubtree;

    payday.$currentSubtree
        .html("")
        .append($("<heading>" + subtree.title + "</heading>"));

    payday.$points = $("#points");

    var $table = $("<table>")
        .appendTo(payday.$currentSubtree);

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
                .html(t+1)
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
                .addClass("skill skill-" + skill.number)
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
};

function setSubtree(subtree) {
    payday.currentSubtree = subtree;

    $(".subtree-info").removeClass("active");
    payday.$buildOverviewLink.toggleClass("active", !subtree);

    if(subtree) {
        $("#subtree-info-" + subtree.number).addClass("active");

        buildTable();
    }

    calculatePoints();

    payday.$currentSubtree.toggleClass("hidden", !subtree);
    payday.$buildOverview.toggleClass("hidden", !!subtree);
};

function initHTML() {
    payday.$currentSubtree = $("#current-subtree");
    payday.$treesList = $("#trees-list");
    payday.$points = $("#points");
    payday.$pointsMessage = $("#points-message");
    payday.$buildOverview = $("#build-overview");
    payday.$buildOverviewTable = $("table", payday.$buildOverview);
    payday.$buildName = $("#build-name").on("change", function() {
        var newVal = payday.$buildName.val();
        if(newVal && newVal !== payday.generatedName) {
            queryString.set("name", newVal);
        }
        else {
            if(!newVal || getUrlParameter("name")) {
                queryString.remove("name");
                payday.$buildName.val(payday.generatedName);
            }
        }
    });
    payday.$buildOverviewLink = $("#build-overview-link").on("click", function() {
        setSubtree(null);
    });


    var $overviewTR = $("<tr>")
        .appendTo(payday.$buildOverviewTable)
        .append($("<th>")
            .html("Tree")
            .addClass("overview-tree-heading")
        )
        .append($("<th>").html("Subtree"))

    for(var i = 0; i < payday.numberOfTiers; i++) {
        $overviewTR.append($("<th>")
            .html("Tier "+ (i+1))
            .addClass("overview-tier-heading")
        );
    }

    $overviewTR.append("Points");

    var $trees = {};
    var $overviewTrees = {};
    forEachSubtree(function(subtree, tree) {
        subtree.adjective = subtree.adjective || subtree.title;
        subtree.noun = subtree.noun || subtree.title;

        // Build the overview table
        var $overviewRow = $("<tr>")
            .appendTo(payday.$buildOverviewTable)
            .attr("id", "overview-subtree-" + subtree.number);

        if(!$trees[tree.title]) {
            var $treeDiv = $("<li>")
                .append($("<heading>" + tree.title + "</heading>"))
                .appendTo(payday.$treesList);

            $trees[tree.title] = $("<ul>")
                .appendTo($treeDiv);

            $overviewRow
                .addClass("new-tree")
                .append($("<td>")
                    .attr("rowspan", tree.trees.length)
                    .addClass("overview-tree-title")
                    .append($("<div>").html(tree.title))
                );
        }
        $overviewRow.append($("<td>")
            .html(subtree.title)
            .addClass("overview-subtree-title")
            .on("click", function() {
                setSubtree(subtree);
            })
        );

        for(var i = 0; i < subtree.tiers.length; i++) {
            var tier = subtree.tiers[i];
            var $overviewTier = $("<td>")
                .appendTo($overviewRow)
                .attr("id", "overview-tier-" + subtree.number + "-" + tier.number);

            for(var j = 0; j < tier.length; j++) {
                var skill = tier[j];
                var $overviewSkill = $("<div>")
                    .appendTo($overviewTier)
                    .addClass("skill skill-" + skill.number)
                    .attr("title", "Basic:\n • "+ skill.basic + "\n———\nAced:\n • " + skill.aced)
                    .html(skill.title);

                (function(skill, $overviewSkill) {
                    $overviewSkill.on("click", function() {
                        if(skill.availible) {
                            if(!skill.taken) {
                                skill.taken = "basic";
                            }
                            else if(skill.taken === "basic") {
                                skill.taken = "aced";
                            }
                            else {
                                skill.taken = false;
                            }

                            calculatePoints();
                        }
                    });
                })(skill, $overviewSkill);
            }
        }

         $overviewRow.append($("<td>")
            .addClass("subtree-points subtree-" + subtree.number + "-points")
            .html(0)
        );

        // Build the info pane
        $treeUL = $trees[tree.title];

        var $li = $("<li>")
            .addClass("subtree-info")
            .attr("id", "subtree-info-" + subtree.number)
            .append($("<span>")
                .addClass("subtree-link")
                .html(subtree.title)
            )
            .append($("<span>")
                .addClass("points subtree-" + subtree.number + "-points")
                .html("0")
            )
            .on("click", function(event) {
                event.stopPropagation();
                setSubtree(subtree);
            });

        $treeUL.append($li);
    });
};

function updateFromURL() {
    var queryParms = queryString.getAll();
    forEachSkill(function(skill, tier, subtree, tree) {
        var q = queryParms[skill.number];
        if(q) {
            skill.taken = q === "b" ? "basic" : "aced";
        }
        else {
            skill.taken = false;
        }
    });
};

function init() {
    var $trees = $("#trees");

    var subtrees = 0;
    payday.subtrees = [];
    payday.numberOfTiers = 0;
    for(var i = 0; i < payday.trees.length; i++) {
        var tree = payday.trees[i];
        tree.number = i;

        for(var j = 0; j < tree.trees.length; j++) { // subtrees for each "main" tree, e.g. Mastermind
            var subtree = tree.trees[j];
            subtree.number = subtrees;
            subtrees++;
            payday.subtrees.push(subtree);
            payday.numberOfTiers = Math.max(payday.numberOfTiers, subtree.tiers.length);

            for(var t = subtree.tiers.length-1; t >= 0; t--) {
                subtree.tiers[t].number = t;
            }
        }
    }

    var n = 1;
    forEachSkill(function(skill, tier, subtree, tree) {
        skill.tier = tier;
        skill.subtree = subtree;
        skill.number = n++;

        tier.subtree = subtree;
    });

    updateFromURL();

    initHTML();

    setSubtree(null);

    window.onpopstate = function() {
        updateFromURL();
        calculatePoints();
    };
};

// get the tree data from the json file
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
