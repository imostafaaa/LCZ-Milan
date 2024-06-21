
/*here starts the imports Which is PRISMA images and Sentinel-2 images along with UCP layers and
 ClimaMi imagery*/

var app = {},
    s2image2 = ee.Image("projects/polimi-lcz0-01/assets/S2_20230322_20m_all_bands_clip"),
    s2image1 = ee.Image("projects/polimi-lcz0-01/assets/S2_20230210_20m_all_bands_clip"),
    s2image3 = ee.Image("projects/polimi-lcz0-01/assets/S2_20230426_20m_all_bands_clip"),
    s2image4 = ee.Image("projects/polimi-lcz0-01/assets/S2_20230625_20m_all_bands_clip"),
    s2image6 = ee.Image("projects/polimi-lcz0-01/assets/S2_20230819_20m_all_bands_clip"),
    prImage1 = ee.Image("projects/polimi-lcz0-01/assets/PR_20230209_30m"),
    prImage2 = ee.Image("projects/polimi-lcz0-01/assets/PR_20230322_30m"),
    prImage3 = ee.Image("projects/polimi-lcz0-01/assets/PR_20230408_30m"),
    prImage4 = ee.Image("projects/polimi-lcz0-01/assets/PR_20230617_30m"),
    prImage5 = ee.Image("projects/polimi-lcz0-01/assets/PR_20230710_30m"),
    prImage6 = ee.Image("projects/polimi-lcz0-01/assets/PR_20230808_30m"),
    clImage1 = ee.Image("projects/polimi-lcz0-01/assets/raster_massima_ESTATE_UHI_2200"),
    clImage2 = ee.Image("projects/polimi-lcz0-01/assets/raster_massima_ONDATA_DI_CALORE_1100"),
    clImage3 = ee.Image("projects/polimi-lcz0-01/assets/raster_massima_ONDATA_DI_CALORE_2200"),
    clImage4 = ee.Image("projects/polimi-lcz0-01/assets/raster_media_ESTATE_UHI_2200"),
    clImage5 = ee.Image("projects/polimi-lcz0-01/assets/raster_media_INVERNO_UHI_1100"),
    clImage6 = ee.Image("projects/polimi-lcz0-01/assets/raster_media_INVERNO_UHI_2200"),
    clImage7 = ee.Image("projects/polimi-lcz0-01/assets/raster_media_ONDATA_DI_CALORE_1100"),
    clImage8 = ee.Image("projects/polimi-lcz0-01/assets/raster_media_ONDATA_DI_CALORE_2200"),
    clImage9 = ee.Image("projects/polimi-lcz0-01/assets/raster_minima_INVERNO_UHI_2200"),
    clImage10 = ee.Image("projects/polimi-lcz0-01/assets/raster_minima_INVERNO_UHI_1100"),
    s2Set1 = ee.FeatureCollection("projects/polimi-lcz0-01/assets/S2_20230210"),
    s2Set2 = ee.FeatureCollection("projects/polimi-lcz0-01/assets/S2_20230322"),
    s2Set3 = ee.FeatureCollection("projects/polimi-lcz0-01/assets/S2_20230426"),
    s2Set4 = ee.FeatureCollection("projects/polimi-lcz0-01/assets/S2_20230625"),
    s2Set5 = ee.FeatureCollection("projects/polimi-lcz0-01/assets/S2_20230710"),
    s2Set6 = ee.FeatureCollection("projects/polimi-lcz0-01/assets/S2_20230819"),
    ucp1 = ee.Image("projects/polimi-lcz0-01/assets/SVF_20230209_30m"),
    ucp2 = ee.Image("projects/polimi-lcz0-01/assets/buildings_20230209_30m"),
    ucp3 = ee.Image("projects/polimi-lcz0-01/assets/canopy_height_ETH_20230209_30m"),
    ucp4 = ee.Image("projects/polimi-lcz0-01/assets/imperviousness_20230209_30m"),
    ucp5 = ee.Image("projects/polimi-lcz0-01/assets/percentage_buildings_20230209_30m");

// Define the image collection for Sentinel-2 (S2)
var s2ImageCollection = ee.ImageCollection([]);

// Add S2 images to the collection
s2ImageCollection = s2ImageCollection.merge(s2image1).merge(s2image2).merge(s2image3)
                                  .merge(s2image4).merge(s2image5).merge(s2image6);

// Define the image collection for PRISMA
var prImageCollection = ee.ImageCollection([]);

// Add PRISMA images to the collection
prImageCollection = prImageCollection.merge(prImage1).merge(prImage2).merge(prImage3)
                                  .merge(prImage4).merge(prImage5).merge(prImage6);
                                  
// Define the image collection for CLIP
var clImageCollection = ee.ImageCollection([]);

// Add CLIP images to the collection
clImageCollection = clImageCollection.merge(clImage1).merge(clImage2).merge(clImage3)
                                  .merge(clImage4).merge(clImage5).merge(clImage6)
                                  .merge(clImage7).merge(clImage8).merge(clImage9)
                                  .merge(clImage10);
                                  
// Define the image collection for UCP
var ucpImageCollection = ee.ImageCollection([ucp1, ucp2, ucp3, ucp4, ucp5]);

// Define the training sets for Sentinel-2
var s2TrainingSets = ee.FeatureCollection([s2Set1, s2Set2, s2Set3, s2Set4, s2Set5, s2Set6]);
// Create an empty dictionary to store the state of each checkbox
var selectedUcpLayers = {}; 
// Create an array to store references to the checkboxes
var checkboxRefs = [];

// Define the center coordinates for the main map
var center = {lon: 9.188540, lat: 45.364664, zoom: 9};
var vizParams = {
  bands: ['b1'],
  min: 0,
  max: 0.5,
 
};

// Retrieve the main map widget
var mainMap = ui.root.widgets().get(0);
var uiRootIndex = 0;

var classificationOutput

// Function to start the export process
var startExport = function (image,id) {
  var exportTask = Export.image.toDrive({
    image: image,
    description: id + '_classified',
    scale: 30, // Resolution in meters
    region: image.geometry().bounds(), // Region of interest
    fileFormat: 'GeoTIFF',
    crs: 'EPSG:4326', // Coordinate Reference System
    maxPixels: 1e9 // Max number of pixels to export
  })

}

/*   It was planned to apply PCA analysis on PRISMA I amges to reduce its 239 bands into 9 principal
 components to facilitate the classification process but GEE threw a Time-out error
*/ 

// // Function to apply Principal Component Analysis (PCA) to PRISMA image
// var applyPcaToPrisma = function(image){
//     // Store the original image
//     var orig = image;
//     // Get the geometry of the image
//     var region = image.geometry();
//     // Set the scale for operations
//     var scale = 30;
//     // Define the band names to be used in PCA
//     // var bandNames =['b1', 'b2', 'b3', 'b20', 'b21', 'b30', 'b35', 'b40', 'b45'];
//     var bandNames=image.bandNames()
//     print(image.bandNames())
//     // Select specified bands and unmask the image
//     image = image.select(bandNames).unmask();
    
//       // Apply masking for no value on PRISMA images
//     var threshold = -0; // Adjust the threshold value as per your image
//     var blackMask = image.neq(threshold);
//     image = image.updateMask(blackMask);   
    
//     // Calculate the number of components
//     var numComponents = bandNames.length;

//     // Calculate mean values for each band
//     var meanDict = image.reduceRegion({
//         reducer: ee.Reducer.mean(),
//         geometry: region,
//         scale: scale,
//         maxPixels: 1e9
//     });
//     // Convert mean values to an image and rename bands
//     var means = ee.Image.constant(meanDict.values(bandNames)).rename(bandNames);

//     // Center the image by subtracting mean values
//     var centered = image.subtract(means);

//     // Function to generate new band names
//     var getNewBandNames = function(prefix) {
//         var seq = ee.List.sequence(1, 239);
//         return seq.map(function(b) {
//             return ee.String(prefix).cat(ee.Number(b).int());
//         });
//     };

//     // PCA function
//     var getPrincipalComponents = function(centered, scale, region, numComponents) {
//         var arrays = centered.toArray();
//         var covar = arrays.reduceRegion({
//             reducer: ee.Reducer.centeredCovariance(),
//             geometry: region,
//             scale: scale,
//             maxPixels: 1e9
//         });
//         var covarArray = ee.Array(covar.get('array'));
//         var eigens = covarArray.eigen();
//         var eigenValues = eigens.slice(1, 0, 1);
//         var eigenVectors = eigens.slice(1, 1);
//         var arrayImage = arrays.toArray(1);
//         var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);

//         var sdImage = ee.Image(eigenValues.sqrt())
//             .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);

//         return principalComponents.arrayProject([0])
//             .arrayFlatten([getNewBandNames('pc')])
//             .divide(sdImage);
//     };

//     // Obtain principal components
//     var pcImage = getPrincipalComponents(centered, scale, region);
//     // print(pcImage)
//     // print( ee.Image(image.addBands(pcImage)))
//     // Add principal components as new bands to the original image
//     return ee.Image(image.addBands(pcImage));
// };



// Function to classify an image based on selected parameters
var classifyImage = function(filteringId){
    // Filter training set based on selected ID
    var s2Set = s2TrainingSets.filter(ee.Filter.eq('id', filteringId)).first();
    
    // Define default bands for classification
    var bands
    var targetImage;

    // Determine which data source is selected
    if (app.picker.S2Select.getValue()) {
        s2Set = s2TrainingSets.filter(ee.Filter.eq('id', filteringId)).first();
        targetImage = s2ImageCollection.filter(ee.Filter.eq('id', filteringId)).first();
        bands = targetImage.bandNames();
    } else if (app.picker.prSelect.getValue()) {
        s2Set = s2TrainingSets.filter(ee.Filter.eq('prId', filteringId)).first();

        targetImage = prImageCollection.filter(ee.Filter.eq('id', filteringId)).first();
        bands = targetImage.bandNames();
        // Map.addLayer(targetImage, vizParams, 'raw');
        
        // Select a single band to work with
        var singleBand = targetImage.select('b1');
    
        // Apply masking for no value on PRISMA images
        var threshold = -0; // Adjust the threshold value as per your image
        var blackMask = singleBand.neq(threshold);
        singleBand = singleBand.updateMask(blackMask);   
     
        // Convert the single band to integer type
        singleBand = singleBand.toInt();
       
        
        // Convert the mask to a binary image (1 for valid pixels, 0 for masked pixels)
        var mask = singleBand.mask().reduce(ee.Reducer.anyNonZero()).selfMask();
      
        // Convert the masked image to a vector (geometry)
        var vector = mask.reduceToVectors({
          geometryType: 'polygon',
          reducer: ee.Reducer.countEvery(),
          scale: 30,
          maxPixels: 1e8,
          bestEffort: true,
        });
        
        if(filteringId==='PR_20230710_30m'){
           var valuePartBounds = ee.Geometry.Polygon(vector.geometry().coordinates().get(2))
        }else{
           valuePartBounds = ee.Geometry.Polygon(vector.geometry().coordinates().get(0))
        }
        
        // Map.addLayer(valuePartBounds, {color: 'red'}, 'Visible Part Bounds');
            
       
        // var pca = applyPcaToPrisma(targetImage);
        // print(pca)
        // var composite = targetImage.addBands(pca);
        // print(composite)
        

        // // Add PCA composite to the map
        // Map.addLayer(targetImage, {gamma: [0.95, 1.1, 1], min: 0, max: .15,
        // bands: ['b1', 'b3', 'b2']}, 'pca_Composite');
    }

    // Add UCP data if selected
    if (selectedUcpLayers) {
        var selectedIds = Object.keys(selectedUcpLayers)
       
        selectedIds.forEach(function(id) {
            var ucpImage = ucpImageCollection.filter(ee.Filter.eq('id', id)).first();
            targetImage= targetImage.addBands(ucpImage);
            bands = targetImage.bandNames();
        })
        
        
    }
    

    // Convert s2Set to FeatureCollection
    s2Set = ee.FeatureCollection(s2Set);

    // Remap land cover class values
    var classValues = [2, 3, 5, 6, 8, 101, 102, 104, 105, 106, 107];
    var remapValues = ee.List.sequence(0,10);
    var features = s2Set.toList(s2Set.size());
    features = ee.FeatureCollection(features).remap(classValues, remapValues, 'LCZ');

    // Add random value field and split data into training and validation sets
    features = features.randomColumn();
    var trainingSample = features.filter('random <= 0.8');
    var validationSample = features.filter('random > 0.8');
    // Map.addLayer(trainingSample, {}, 'Filtered Training Data');

    // Sample the training data
    var training = targetImage.select(bands).sampleRegions({
        collection: trainingSample,
        properties: ['LCZ'],
        scale: 70,
        geometries: true
    });

    // Train a classifier using Random Forest algorithm
    var classifier = ee.Classifier.smileRandomForest(70).train({
        features: training,
        classProperty: 'LCZ',
        inputProperties: bands
    });

    // Get confusion matrix and overall accuracy for the training sample
    var trainAccuracy = classifier.confusionMatrix();
    
    print(trainAccuracy)
    

    // Classify the image
    var classified = targetImage.classify(classifier);

    // Apply median filter to smooth the results
    var kernel = ee.Kernel.circle({radius: 3});
    var smoothedClassifiedImage = classified.focalMedian({
        kernel: kernel,
        iterations: 1
    });

    // Create legend for classification report
    var legend = ui.Panel({
        style: {
            position: 'bottom-right',
            padding: '8px 15px'
        }
    });

    // Add legend title
    var legendTitle = ui.Label({
        value: 'Classification report',
        style: {
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '0 0 4px 0',
            padding: '0'
        }
    });
    legend.add(legendTitle);

    // Display overall accuracy
    trainAccuracy.accuracy().evaluate(function(value) {
        var label = ui.Label({
            value: 'Overall accuracy: ' + (value * 100).toFixed(3) + '%',
            style: {margin: '0 0 4px 6px'}
        });
        legend.add(label);
    });
    
   // Label for displaying the number of bands (placeholder)
   var bandCountLabel = ui.Label('Number of bands: calculating...');
   legend.add(bandCountLabel);
   
   var classReportLabels
   var numberOfBands = bands.size();
   // Use evaluate to asynchronously fetch the number of bands
   numberOfBands.evaluate(function(num) {
   bandCountLabel.setValue('Number of bands: ' + num);
   });


    // Display other classification report labels
    classReportLabels = [
    'Number of classes: ' + classValues.length];
    for (var i = 0; i < classReportLabels.length; i++) {
        var label = classReportLabels[i];
        var row = ui.Panel({
            widgets: [
                ui.Label({
                    value: label,
                    style: {margin: '0 0 4px 6px'}
                })
            ],
            layout: ui.Panel.Layout.Flow('horizontal')
        });
        legend.add(row);
    }

    // Add legend to the map
    Map.add(legend);
    
  
    if (app.picker.prSelect.getValue()) {
    // Clip the classification output
    smoothedClassifiedImage= smoothedClassifiedImage.clip(valuePartBounds)}
    classificationOutput= smoothedClassifiedImage
  
    
    // Return the smoothed classified image
     return smoothedClassifiedImage
};


// Function to add legend to the map
var addLegend = function(){
    // Create legend panel
    var legend = ui.Panel({
        style: {
            position: 'bottom-right',
            padding: '8px 15px'
        }
    });
    
    // Create legend title
    var legendTitle = ui.Label({
        value: 'Classes',
        style: {
            fontWeight: 'bold',
            fontSize: '18px',
            margin: '0 0 4px 0',
            padding: '0'
        }
    });
    
    // Add legend title to the panel
    legend.add(legendTitle);
    
    // Define classes palette and labels
    var classesPalette = ['#D10000', '#CD0000', '#FF6600', '#FF9955', '#BCBCBC',
    '#006A00', '#00AA00', '#B9DB79', '#545454', '#FBF7AF', '#6A6AFF'];
    var classesLabels = ['Compact mid-rise', 'Compact low-rise', 'Open mid-rise',
    'Open low-rise', 'Large low-rise', 'Dense trees', 'Scattered trees', 'Low plants',
    'Bare rock or paved', 'Bare soil or sand', 'Water'];
    
    // Iterate over classes to create legend entries
    for (var i = 0; i < classesPalette.length; i++) {
        var color = classesPalette[i];
        var label = classesLabels[i];
        var row = ui.Panel({
            widgets: [
                // Add color box
                ui.Label({
                    style: {
                        backgroundColor: color,
                        padding: '8px',
                        margin: '0 0 4px 0'
                    }
                }),
                // Add class label
                ui.Label({
                    value: label,
                    style: {margin: '0 0 4px 6px'}
                })
            ],
            layout: ui.Panel.Layout.Flow('horizontal')
        });
        
        // Add the row to the legend panel
        legend.add(row);
    }
    
    // Add the legend panel to the map
    Map.add(legend);
}






/* A UI to interactively filter imagery collections, select individual images,
display them with a variety of visualizations, and classify them.
The namespace for our application. All the state is kept in here.*/

// Creates the UI panels. 
app.createPanels = function() {
    //The introduction section.
    app.intro = {
        panel: ui.Panel([
        
        ])
    };

    app.picker = {
        // Create selects with functions that react to the "change" event.
        prSelect: ui.Select({placeholder: 'Select an image ID', onChange: app.refreshMapLayer}),
        S2Select: ui.Select({placeholder: 'Select an image ID', onChange: app.refreshMapLayer}),
        clSelect: ui.Select({placeholder: 'Select an image ID', onChange: app.refreshMapLayer}),
        
    };

    /* The panel for the picker section with corresponding widgets. */
    app.picker.panel = ui.Panel({
        widgets: [
            ui.Label({value: '• Select PRISMA image', style: {backgroundColor: 'rgba(0, 0, 0, 0.0)',
            fontSize: '11px', fontWeight: 'bold', margin: '8px 8px 8px 8px'}}),
            ui.Panel([app.picker.prSelect], ui.Panel.Layout.flow('horizontal')),
            ui.Label({value: '• Select Sentinel-2 image', style: {backgroundColor:
            'rgba(0, 0, 0, 0.0)', fontSize: '11px', fontWeight: 'bold', margin: '8px 8px 8px 8px'}}),
            ui.Panel([app.picker.S2Select], ui.Panel.Layout.flow('horizontal')),
            ui.Label({value: '• Select ClimaMi image', style: {backgroundColor:
            'rgba(0, 0, 0, 0.0)', fontSize: '11px', fontWeight: 'bold', margin: '8px 8px 8px 8px'}}),
            ui.Panel([app.picker.clSelect], ui.Panel.Layout.flow('horizontal')),
            ui.Label({value: '• Select UCP layers', style: {backgroundColor: 'rgba(0, 0, 0, 0.0)',
            fontSize: '11px', fontWeight: 'bold', margin: '8px 8px 8px 8px'}}),
            ui.Label({value: 'Choose layers to add to the already chosen PRISMA or Sentinel-2'
            +'image before classification.', style: {backgroundColor: 'rgba(0, 0, 0, 0.0)',
            fontSize: '11px', fontWeight: '500', margin: '8px 8px 8px 8px'}}),
            
        ],
        style: app.SECTION_STYLE
    });
    
    

    /* The visualization section. */
    // Create two maps.
    var leftMap = ui.Map(center);
    var rightMap = ui.Map(center);

    // Remove UI controls from both maps, but leave zoom control on the left map.

    app.vis = {

        label: ui.Label({style: {backgroundColor: 'rgba(0, 0, 0, 0.0)', fontSize: '11px',
        fontWeight: '500', margin: '8px 8px 8px 8px'}}),
        // Create a select with a function that reacts to the "change" event.
        select: ui.Select({

            items: Object.keys(app.VIS_OPTIONS),
            onChange: function() {
                // Update the label's value with the select's description.
                var option = app.VIS_OPTIONS[app.vis.select.getValue()];
                app.vis.label.setValue(option.description.getValue());
                // Refresh the map layer.
                app.refreshMapLayer();
            }
        }),

        mapSlider: ui.SplitPanel({
            firstPanel: leftMap,
            secondPanel: rightMap,
            orientation: 'horizontal',
            wipe: true
        }),

        sliderCheckbox: ui.Checkbox({
            label: 'Add split panel',
            value: false,
            onChange:function(checked) {
                if (checked) {
                    app.vis.sliderCheckbox=ui.Checkbox({
                        label: 'Add split panel',
                        value: true,
                    })
                    var s2ImageId = app.picker.S2Select.getValue();
                    var prImageId = app.picker.prSelect.getValue();
                    // Get the visualization options.
                    var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
                    var s2Image = s2ImageCollection.filter(ee.Filter.eq('id',s2ImageId ))
                    .first().select(visOption.visParams.bands)
                    var prImage = prImageCollection.filter(ee.Filter.eq('id',prImageId ))
                    .first().select(visOption.visParams.bands)
                    var threshold = -0; // Adjust the threshold value as per your image
                    var blackMask = prImage.gt(threshold);

                    var processedImage = prImage.updateMask(blackMask);
                    var s2Clipped= s2Image.clip(processedImage.geometry().bounds())
                    var prClipped= processedImage.clip(s2Image.geometry().bounds())
                    
                  
                    leftMap.clear();
                    rightMap.clear();
                    leftMap.addLayer(prClipped, app.VIS_OPTIONS['prisma'].visParams, prImageId);
                    rightMap.addLayer(s2Clipped, visOption.visParams, s2ImageId);
                    var linker = ui.Map.Linker([leftMap, rightMap]); 
                    ui.root.clear()
                    app.boot(sliderUi)
                    ui.root.widgets().add(app.vis.mapSlider);

                } else {
                    ui.root.clear()
                    ui.root.widgets().reset([mainMap]);
                    Map.clear();
                    app.picker.prSelect.setValue(null)
                    app.picker.S2Select.setValue(null)
                    app.boot(sliderUi)
                }
            }
        }),

        multiMapCheckbox: ui.Checkbox({
            label: 'Multi maps view',
            value: false,
            onChange:function(checked) {
                var s2ImageId = app.picker.S2Select.getValue();
                var prImageId = app.picker.prSelect.getValue();
                var clImageId = app.picker.clSelect.getValue();
                // function to create map 1
                function createS2Map() {
                    var map = new ui.Map(center);
                    var s2Image = s2ImageCollection.filter(ee.Filter.eq('id',s2ImageId )).first();
                    var prImage = prImageCollection.filter(ee.Filter.eq('id',prImageId )).first();
                    var threshold = -0; // Adjust the threshold value as per your image
                    var blackMask = prImage.gt(threshold);
                    var processedImage = prImage.updateMask(blackMask);
                    var s2Clipped= s2Image.clip(processedImage.geometry().bounds())
                    map.addLayer(s2Clipped,app.VIS_OPTIONS['True color (b4/b3/b2)'].
                    visParams, s2ImageId);
                    map.add(ui.Label('Sentinel-2', {position:'bottom-center'}))
                    return map;

                }

                function createPrMap() {
                    var map = new ui.Map(center);
                    var prImage = prImageCollection.filter(ee.Filter.eq('id',prImageId )).first();
                    var s2Image = s2ImageCollection.filter(ee.Filter.eq('id',s2ImageId )).first();
                    var threshold = -0; // Adjust the threshold value as per your image
                    var blackMask = prImage.gt(threshold);
                    var processedImage = prImage.updateMask(blackMask);
                    var prClipped= processedImage.clip(s2Image.geometry().bounds())
                    // Add the image to the map with the corresponding visualization options.
                    map.addLayer(prClipped, app.VIS_OPTIONS['prisma'].visParams, prImageId);
                    map.add(ui.Label('PRISMA', {position:'bottom-center'}))
                    return map;

                }

                function createClMap() {
                    var map = new ui.Map(center);
                    var clImage = clImageCollection.filter(ee.Filter.eq('id',clImageId )).first();
                    var prImage = prImageCollection.filter(ee.Filter.eq('id',prImageId )).first();
                    var threshold = -0; // Adjust the threshold value as per your image
                    var blackMask = prImage.gt(threshold);
                    var processedImage = prImage.updateMask(blackMask);
                    var clClipped= clImage.clip(processedImage.geometry().bounds())
                    map.addLayer(clClipped, {min: -5.5, max: 34, palette: ['FFFFFF','040274',
                        '040281', '0502a3', '0502b8', '0502ce', '0502e6',
                        '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
                        '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
                        'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
                        'ff0000', 'de0101', 'c21301', 'a71001', '911003']}, clImageId);
                    map.add(ui.Label('ClimaMi', {position:'bottom-center'}));
                    return map;
                }

                if (checked) {
                    var maps = [];

                    if ( s2ImageId && prImageId && clImageId) {
                        maps = [createS2Map(), createPrMap(), createClMap()];
                        var panel = ui.Panel({
                            layout: ui.Panel.Layout.flow('horizontal'),
                            style: {width: '100vw', height: '87vh'}
                        });

                        var linker = ui.Map.Linker(maps)
                        maps.map(function(map) {
                            panel.add(map)
                        })

                        ui.root.clear();
                        app.boot(sliderUi)
                        ui.root.add(panel)


                    }

                } else {

                    ui.root.clear()
                    ui.root.widgets().reset([mainMap]);
                    Map.clear();
                    app.picker.prSelect.setValue(null)
                    app.picker.S2Select.setValue(null)
                    app.picker.clSelect.setValue(null)
                    app.boot(sliderUi)
                }

            }

        }),


    };

    // Create a panel to hold the UCP layers
    app.ucpPanel  = ui.Panel({
      widgets:[],
      layout: ui.Panel.Layout.flow('vertical'),
      style: app.SECTION_STYLE
    });
     var ucpComputedIds = ucpImageCollection.reduceColumns(ee.Reducer.toList(), ['id'])
      .get('list');
      // Function to create a checkbox for each image
      ucpComputedIds.evaluate(function(images) {
      images.forEach(function(image) {
     
        var checkbox = ui.Checkbox({
          label: image,
          onChange: function(checked) {
            if (checked) {
              selectedUcpLayers[image] = image;
            } 
         
          }
        });
        app.ucpPanel.add(checkbox);
        checkboxRefs.push(checkbox);
      });
    });

    /* The panel for the visualization section with corresponding widgets. */
    app.vis.panel = ui.Panel({
        widgets: [
            ui.Label({value: '• Select a visualization', style: {backgroundColor:
            'rgba(0, 0, 0, 0.0)', fontSize: '11px', fontWeight: 'bold', margin: '8px 8px 8px 8px'}}),
            app.vis.sliderCheckbox,
            app.vis.multiMapCheckbox

        ],
        style: app.SECTION_STYLE
    });
    
    /* The export section. */
  app.export = {
    button: ui.Button({
      label: 'Export Image to Drive',
      // React to the button's click event.
      onClick: 
      function() {
        var id
        if(app.picker.S2Select.getValue()){
          id = app.picker.S2Select.getValue()
        } else if(app.picker.prSelect.getValue()){
          id = app.picker.prSelect.getValue()
        }
        
       startExport(classificationOutput, id)
      }
    })
  };

  /* The panel for the export section with corresponding widgets. */
  app.export.panel = ui.Panel({
    widgets: [
      ui.Label({value: '• Export Classification Output ', style: {backgroundColor: 'rgba(0, 0, 0, 0.0)',
            fontSize: '11px', fontWeight: 'bold', margin: '8px 8px 8px 8px'}}),
      app.export.button
    ],
    style: app.SECTION_STYLE
  });


    // Default the select to the first value.
    app.vis.select.setValue(app.vis.select.items().get(0));

};


 
/** Creates the app helper functions. */
app.createHelpers = function() {

  /**
   * Enables or disables loading mode.
   * @param {boolean} enabled Whether loading mode is enabled.
   */
  app.setLoadingMode = function(enabled) {
    // Set each of the widgets to the given enabled mode.
    var loadDependentWidgets = [
      app.vis.select,
      app.picker.S2Select,
      app.picker.prSelect,
      app.picker.clSelect,
      app.export.button,
     
    ];
    loadDependentWidgets.forEach(function(widget) {
      widget.setDisabled(enabled);
    });
  };

  /** Applies the selection filters currently selected in the UI. */
  app.applyFilters = function() {
    Map.clear();
    app.setLoadingMode(true);

    // Get the list of computed ids.
    var computedIds = s2ImageCollection
      .reduceColumns(ee.Reducer.toList(), ['id'])
      .get('list');
    var prComputedIds = prImageCollection.reduceColumns(ee.Reducer.toList(), ['id'])
      .get('list');
    var clComputedIds = clImageCollection.reduceColumns(ee.Reducer.toList(), ['id'])
      .get('list');
   
    computedIds.evaluate(function(ids) {
      // Update the image picker with the given list of ids.
      app.setLoadingMode(false);
      app.picker.S2Select.items().reset(ids);
    });
    prComputedIds.evaluate(function(ids) {
      // Update the image picker with the given list of ids.
      app.setLoadingMode(false);
      app.picker.prSelect.items().reset(ids);
    });

    clComputedIds.evaluate(function(ids) {
      // Update the image picker with the given list of ids.
      app.setLoadingMode(false);
      app.picker.clSelect.items().reset(ids);
    });

  };

  /** Refreshes the current map layer based on the UI widget states. */
  app.refreshMapLayer = function() {
    Map.clear();

    var visOption = app.VIS_OPTIONS[app.vis.select.getValue()];
    var s2ImageId = app.picker.S2Select.getValue();
    var prImageId = app.picker.prSelect.getValue();
    var clImageId = app.picker.clSelect.getValue();
    

    if (prImageId) {

      Map.clear();
      // If an image id is found, create an image.
      var prImage = prImageCollection.filter(ee.Filter.eq('id', prImageId)).first();
      var threshold = -0; // Adjust the threshold value as per your image
      var blackMask = prImage.gt(threshold);
      var processedImage = prImage.updateMask(blackMask);
      // Add the image to the map with the corresponding visualization options.
      Map.addLayer(processedImage, app.VIS_OPTIONS['prisma'].visParams, prImageId);


      var classifyButtonHandler = function() {

        // Call the classifyImage function
        var classifiedImage = classifyImage(prImageId);
       
 
        // Display the classified image
        Map.addLayer(classifiedImage, {
          min: 0,
          max: 10,
          palette: ['#D10000', '#CD0000', '#FF6600', '#FF9955', '#BCBCBC', '#006A00', '#00AA00',
          '#B9DB79', '#545454', '#FBF7AF', '#6A6AFF']
        }, 'Classified Image');

        // Add legend to the map
        addLegend()

      }
      // Classification button.
      var classifyButton = ui.Button({
        label: 'Classify',
        onClick: classifyButtonHandler,
        style: {
          margin: '0px'
        }
      });

      // Classify panel container.
      var buttonContainer = ui.Panel({
        widgets: [classifyButton],
        style: {
          position: 'bottom-left',
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      });

      Map.add(buttonContainer);

    }
    if (s2ImageId) {
      Map.clear();
      var s2Image = s2ImageCollection.filter(ee.Filter.eq('id', s2ImageId)).first();
      Map.addLayer(s2Image, visOption.visParams, s2ImageId);
   

      classifyButtonHandler = function() {
        // Call the classifyImage function
        var classifiedImage = classifyImage(s2ImageId);

        // Display the classified image
        Map.addLayer(classifiedImage, {
          min: 0,
          max: 10,
          palette: ['#D10000', '#CD0000', '#FF6600', '#FF9955', '#BCBCBC', '#006A00', '#00AA00',
          '#B9DB79', '#545454', '#FBF7AF', '#6A6AFF']
        }, 'Classified Image');

        // Add legend to the map
        addLegend()

      }
      // Show/hide note button.
      classifyButton = ui.Button({
        label: 'Classify',
        onClick: classifyButtonHandler,
        style: {
          margin: '0px'
        }
      });

      // Classify panel container.
      buttonContainer = ui.Panel({
        widgets: [classifyButton],
        style: {
          position: 'bottom-left',
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      });

      Map.add(buttonContainer);

    }

    if (clImageId) {
      Map.clear();
      var clImage = clImageCollection.filter(ee.Filter.eq('id', clImageId)).first();
      Map.addLayer(clImage, {
        min: -5.5,
        max: 34,
        palette: ['FFFFFF', '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
          '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
          '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
          'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
          'ff0000', 'de0101', 'c21301', 'a71001', '911003'
        ]
      }, clImageId);
    }
    if (s2ImageId && prImageId) {
      Map.clear();
      // Add the image to the map with the corresponding visualization options.
      var s2Clipped = s2Image.clip(processedImage.geometry().bounds())
      var prClipped = processedImage.clip(s2Image.geometry().bounds())
      
      Map.addLayer(s2Clipped, visOption.visParams, s2ImageId);
      Map.addLayer(prClipped, app.VIS_OPTIONS['prisma'].visParams, prImageId);
    }
    if (s2ImageId && prImageId && clImageId) {
      Map.clear();
      // Add the image to the map with the corresponding visualization options.
      Map.addLayer(s2Clipped, visOption.visParams, s2ImageId);
      Map.addLayer(prClipped, app.VIS_OPTIONS['prisma'].visParams, prImageId);
      var clClipped = clImage.clip(processedImage.geometry().bounds())
      Map.addLayer(clClipped, {
        min: -5.5,
        max: 34,
        palette: ['FFFFFF', '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
          '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
          '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
          'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
          'ff0000', 'de0101', 'c21301', 'a71001', '911003'
        ]
      }, clImageId);
    }

    // Function to uncheck all checkboxes
    function uncheckAllCheckboxes () {
      checkboxRefs.forEach(function(checkbox) {
        checkbox.setValue(false);
      })
    }

    function refreshButtonHandler() {
      // ui.root.clear()
      Map.clear();
      ui.root.clear()
      uncheckAllCheckboxes()
      app.picker.prSelect.setValue(null)
      app.picker.S2Select.setValue(null)
      app.picker.clSelect.setValue(null)
      ui.root.widgets().reset([mainMap]);
      app.boot(sliderUi)
    }

    // Show/hide note button.
    var refreshButton = ui.Button({
      label: 'Refresh',
      onClick: refreshButtonHandler,
      style: {
        margin: '0px'
      }
    });

    // Notes panel container.
    buttonContainer = ui.Panel({
      widgets: [refreshButton],
      style: {
        position: 'bottom-left',
        padding: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }
    });

    Map.add(buttonContainer);

  }

};


/** 
 * Creates the app constants.
 */
app.createConstants = function() {
  // Collection ID for imagery
  app.COLLECTION_ID = 'LCZ_';
  // Style for sections in the UI
  app.SECTION_STYLE = {margin: '10px 0 0 0'};
  // Style for helper text
  app.HELPER_TEXT_STYLE = {
    margin: '8px 0 -3px 8px',
    fontSize: '10px',
    color: 'gray'
  };
  // Limit for the number of images
  app.IMAGE_COUNT_LIMIT = 10;
  // Visualization options for images
  app.VIS_OPTIONS = {
    'True color (b4/b3/b2)': {
      description: ui.Label({value: 'Ground features appear in colors similar to their ' +
                   'appearance to the human visual system.'}),
      visParams: {gamma: [0.95, 1.1, 1], min: 0, max: .5, bands: ['b4', 'b3', 'b2']}
    },
    'False color (b8/b4/b3)': {
      description: ui.Label({value: 'Vegetation is shades of red, urban areas are ' +
                   'gray or tan, and water appears blue or black.'}),
      visParams: {gamma: [0.95, 1.1, 1], min: 0, max: .5, bands: ['b8', 'b4', 'b3']}
    },
    'prisma': {
      description: ui.Label({value: 'Ground features appear in colors similar to their ' +
                   'appearance to the human visual system.'}),
      visParams: {gamma: [0.95, 1.1, 1], min: 0, max: .15, bands: ['b4', 'b3', 'b2']}
    },
  };
};

/** 
 * Creates the application interface.
 */
app.createConstants();
app.createHelpers();
app.createPanels();

// Main UI panel
var main = ui.Panel({
  widgets: [
    app.intro.panel,
    app.picker.panel,
    app.ucpPanel,
    app.vis.panel,
    app.export.panel
  ],
  style: {width: '320px', padding: '8px'}
});

// UI panel for slider
var sliderUi = ui.Panel({
  widgets: [
    app.intro.panel,
    app.picker.panel,
    app.ucpPanel, 
    app.vis.panel,
    
  ],
  style: {width: '320px', padding: '8px'}
});

// Function to initialize the UI
app.boot = function(uiCase) {
  Map.setCenter(center); 
  ui.root.insert(0, uiCase);
  app.applyFilters();
};

// Initialize the main UI
app.boot(main);

