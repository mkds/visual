function drawTable() {
        var data1 = new google.visualization.DataTable();
        data1.addColumn("string","State");
        data1.addColumn("string","County");
        data1.addColumn("number","Overall_Score");
        data1.addColumn("number","Facilities");
        data1.addColumn("number","Health_Cost");
        data1.addColumn("number","Saftey");
        data1.addColumn("number","Social_association");
        data1.addColumn("number","Primary_care");



        var values=[];
        places.forEach(function(d){values.push([
          d.State,
          d.County,
          d.Overall_Score,
          d.Facilities,
          d.Health_Cost,
          d.Saftey,
          d.Social_association,
          d.Primary_care]);}
        );
        data1.addRows(values);
        var gtable = new google.visualization.Table(document.getElementById('dt1'));

        gtable.draw(data1, {showRowNumber: true, width: '100%', height: '100%',page:'enable',
                    pageSize:20});



      }
