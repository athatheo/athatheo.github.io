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
    // else if (id == "fig1")  {
    //    caption=document.getElementById("figure1_explanation");
       
    //       if (currentText.toUpperCase() === "SHOW MORE...") {
    //       newText = "Show less.";
    //       caption.innerHTML = "<strong>Figure 1: Trade-off Curves.</strong>In Figure 1 below, we plot the trade-off curves between the worst-case costs of lookups and updates for Monkey. As a baseline, we also plot the analogous trade-off curve for state-of-the-art designs that assign the same false positive rate to filters across all levels. To focus on a particular slice of the design space, we enable parameterization of the <em>dataset </em> (number and size of data entries), the <em>environment</em> (size of persistent storage pages), and <em>main memory allocation</em> (size of the LSM-tree's buffer, and total size of all Bloom filters). We enable navigating the curves in Figure 1 to strike a particular balance between lookup cost and update cost by varying the <em> merge operation frequency, </em> which is a function of the merge policy (tiering vs. leveling) and the size ratio between adjacent levels of the LSM-tree. Figure 1 shows that Monkey dominates state-of-the-art deisgns across the whole design space. The reason is that it allocates main memory across the Bloom filters so as to minimize lookup cost, and it can trade the gain in lookup cost for better update cost by varying the merge policy and size ratio. ";
    //    } else {
    //       newText = "Show more...";
    //       caption.innerHTML = "<strong>Figure 1: Trade-off Curves.</strong>In Figure 1 below, we plot the trade-off curves between the worst-case costs of lookups and updates for Monkey. As a baseline, we also plot the analogous trade-off curve for state-of-the-art designs that assign the same false positive rate to filters across all levels.";
    //   }
    // }
    // else if (id == "fig2")  {
    //    caption=document.getElementById("figure2_explanation");
       
    //       if (currentText.toUpperCase() === "SHOW MORE...") {
    //       newText = "Show less.";
    //       caption.innerHTML = "<strong>Figure 2: LSM-tree Visualization.</strong> In Figure 2 below, we give a more detailed comparison of how Monkey and state-of-the-art designs tune Bloom filters across different levels of the LSM-tree. The figure dynamically computes and illustrates the number and sizes of the different levels of the LSM-tree for any configuration specified by the user. Alongside each level, the figure shows the false positive rate that Monkey and state-of-the-art designs assign to filters for that level. In general, the figure shows that Monkey allocates relatively more main memory to filters at shallower levels of the LSM-tree. The intuition is that worst-case lookup cost is equal to the sum of false positive rates across all levels, and since shallower levels contain exponentially less entries, and it takes a lower overall amount of main memory to reduce their false positive rates thereby reducing the overall sum of false positive rates.";
    //    } else {
    //       newText = "Show more...";
    //       caption.innerHTML = "<strong>Figure 2: LSM-tree Visualization.</strong> In Figure 2 below, we give a more detailed comparison of how Monkey and state-of-the-art designs tune Bloom filters across different levels of the LSM-tree.";
    //   }
    // }

    return newText;
}