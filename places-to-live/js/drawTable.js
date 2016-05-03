function drawTable() {
  //Draw google table
        var data1 = new google.visualization.DataTable();
        var data2 = new google.visualization.DataTable();
        data1.addColumn("string","State");
        data1.addColumn("string","County");
        data1.addColumn("number","Overall_Score");
        data1.addColumn("number","Facilities");
        data1.addColumn("number","Health_Cost");
        data1.addColumn("number","Saftey");
        data1.addColumn("number","Social_association");
        data1.addColumn("number","Primary_care");

        data2.addColumn("string","County");
        data2.addColumn("number","Facilities");
        data2.addColumn("number","Health_Cost");
        data2.addColumn("number","Saftey");
        data2.addColumn("number","Social_association");
        data2.addColumn("number","Primary_care");

        var values1=[];
        var values2=[];
        places.forEach(function(d){
            values1.push([
            d.State,
            d.County,
            d.Overall_Score,
            d.Facilities,
            d.Health_Cost,
            d.Saftey,
            d.Social_association,
            d.Primary_care]);
        });
        places.forEach(function(d){
          if (d.State=="NJ"){
            values2.push([
            d.County,
            d.Facilities,
            d.Health_Cost,
            d.Saftey,
            d.Social_association,
            d.Primary_care]);
          }
        }
      );
        data1.addRows(values1);
        data2.addRows(values2);
        var gtable = new google.visualization.Table(document.getElementById('dt1'));
        gtable.draw(data1, {showRowNumber: true, width: '100%', height: '100%',page:'enable',
                    pageSize:20});
        var options = {
         title:"New Jersey",
         width: 1000,
         height: 800,
         legend: { position: 'right', maxLines: 3 },
         bar: { groupWidth: '75%' },
         isStacked: true
       };
       var chart = new google.visualization.BarChart(document.getElementById("dt2"));
      chart.draw(data2, options);

      }
