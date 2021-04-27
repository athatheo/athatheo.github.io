// The following is for the show-more show-less buttons
$(".show-more a").each(function() {
    var $link = $(this);
    var $content = $link.parent().prev("span.text-content");

    var visibleHeight = $content[0].clientHeight;
    var actualHide = $content[0].scrollHeight - 1;

    if (actualHide > visibleHeight) {
        $link.show();
    } else {
        // $link.hide();
    }
});



$(".show-more a").on("click", function() {
    var $link = $(this);
    var $content = $link.parent().prev("span.text-content");
    var linkText = $link.text();
    var id = $(this)[0].id; 
    $content.toggleClass("short-text, full-text");

    $link.text(getShowLinkText(linkText, id));

    return false;
});



function getShowLinkText(currentText, id) {
    var newText = '';
    var caption;
    if (id == "caption1") {
       caption=document.getElementById("figure1_caption");
       if (currentText.toUpperCase() === "SHOW MORE...") {
          newText = "Show less.";
          caption.innerHTML = "<strong>Figure 1.</strong> Trade-off curves between the lookup and update cost for Monkey. As a baseline, we also plot the analogous trade-off curve for state-of-the-art designs that assign the same false positive rate to filters across all levels. To focus on a particular slice of the design space, we enable parameterization of the <em>dataset </em> (number and size of data entries), the <em>environment</em> (size of persistent storage pages), and <em>main memory allocation</em> (size of the LSM-tree's buffer, and total size of all Bloom filters). The audience can vary the <em> merge operation frequency, </em> which is a function of the merge policy (tiering vs. leveling) and the size ratio between adjacent levels of the LSM-tree.<br><em>The LSM-tree design space exhibits a trade-off between lookup cost and update cost that can be navigated by tuning the merge policy and size ratio</em>. In general, the curve for Monkey dominates the curve for the state-of-the-art because Monkey minimizes worst-case query cost by allocating main memory among the Bloom filters so as to minimize the sum of their false positive rates.";
      } else {
          newText = "Show more...";
          caption.innerHTML = "<strong>Figure 1.</strong> Trade-off curves between the lookup and update cost for Monkey. As a baseline, we also plot the analogous trade-off curve for state-of-the-art designs that assign the same false positive rate to filters across all levels.";
      }
    }
    else if (id == "caption2")  {
       caption=document.getElementById("figure2_caption");
       
          if (currentText.toUpperCase() === "SHOW MORE...") {
          newText = "Show less.";
          caption.innerHTML = "<strong>Figure 2.</strong> Monkey allocates relatively more main memory (i.e., lower false positive rates) to Bloom filters at shallower levels of the LSM-tree. The LSM-tree structure and visualization in this figure is dynamically generated based on the configuration selected above. ";
       } else {
          newText = "Show more...";
          caption.innerHTML = "<strong>Figure 2.</strong> Monkey allocates relatively more main memory (i.e., lower false positive rates) to Bloom filters at shallower levels of the LSM-tree.     ";
      }
    }

    return newText;
}