
const FTV = require('../models/benFTV');
const Scambio = require('../models/scambio');

exports.getData = (req, res, next) => {
    let benQuery;
    const tipo = +req.params.tipo;
    const numPratica = req.params.pratica;
    if(tipo == 1){
        benQuery = FTV.aggregate().match(
            { numeroPratica: numPratica}
            ).addFields({
                monthList: {
                    $objectToArray: '$benestare'
                }
            }).project({
                numeroPratica:1,
                anno: 1,
                monthList: 1
            });
    }
    else{
        benQuery = Scambio.aggregate().match(
            { numeroPratica: numPratica}
            ).addFields({
                monthList: {
                    $objectToArray: '$benestare'
                }
            }).project({
                numeroPratica:1,
                anno: 1,
                monthList: 1
            });
    }
    benQuery
    .then(data => {
        res.status(200).json({
            message: 'Benestare fetched succesfully!!',
            benestareList: data
        });
    })
    .catch(error => {
        res.status(500).json({message: 'Getting data-chart failed!'});
    });  
}

exports.getPratica = (req, res, next) => {
    
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const numPratica = req.query.pratica;
    const benQuery = FTV.aggregate().match(
        { numeroPratica: numPratica}
        ).addFields({
            monthList: {
                $objectToArray: '$benestare'
            }
        })
        .unwind('monthList')
        .project({
            numeroPratica: 1,
            anno: 1,
            monthList: 1
        })
        ;
    let fetchedBen;
    if(pageSize && currentPage){
        benQuery.skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    benQuery
    .then(documents =>{
        fetchedBen = documents;
        return FTV.aggregate().match(
            { numeroPratica: numPratica}
            ).addFields({
                monthList: {
                    $objectToArray: '$benestare'
                }
            }).unwind('monthList')
            .group({
                _id: '',
                DocumentiTotali: {
                  $sum: 1
                }
            });
    })
    .then(data => {
        res.status(200).json({
            message: 'Benestare fetched succesfully!!',
            benestareList: fetchedBen,
            total: data[0].DocumentiTotali
        });
    })
    .catch(error => {
        res.status(500).json({message: 'Getting Dettaglio Conto Energia failed!'});
    });  
}

exports.getPraticaScambio = (req, res, next) => {
    
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const numPratica = req.query.pratica;
    const benQuery = Scambio.aggregate().match(
        { numeroPratica: numPratica}
        ).addFields({
            monthList: {
                $objectToArray: '$benestare'
            }
        }).unwind('monthList')
        .project({
            numeroPratica: 1,
            anno: 1,
            monthList: 1
        })
        ;
    let fetchedBen;
    if(pageSize && currentPage){
        benQuery.skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    benQuery
    .then(documents =>{
        fetchedBen = documents;
        return Scambio.aggregate().match(
            { numeroPratica: numPratica}
            ).addFields({
                monthList: {
                    $objectToArray: '$benestare'
                }
            }).unwind('monthList')
            .group({
                _id: '',
                DocumentiTotali: {
                  $sum: 1
                }
            });
    })
    .then(data => {
        res.status(200).json({
            message: 'Benestare fetched succesfully!!',
            benestareList: fetchedBen,
            total: data[0].DocumentiTotali
        });
    })
    .catch(error => {
        res.status(500).json({message: 'Getting Dettaglio Scambio Energia failed!'});
    });  
}

exports.getListaAnomali = (req, res, next) => {
    const pageSize = +req.body.pageSize;
    const currentPage = +req.body.currPage;
    const discostamentoConto = +req.body.discostamento;
    let doc;
    const queryConto = FTV.aggregate().lookup({
        from: 'FTV_avg',
        localField: 'numeroPratica',
        foreignField: '_id',
        as: 'avg'
    })
    .unwind('$avg')
    .addFields({
        diffPerc: {
          $multiply: [
            {
              $divide: [
                {
                  $subtract: [
                    '$benestare.Jun.value',
                    '$avg.avg.Jun.value'
                  ]
                },
                '$avg.avg.Jun.value'
              ]
            },
            100
          ]
        }
    })
    .match({
        diffPerc: {
          $gt: discostamentoConto
        },
        anno: 2019
    })
    .project({
        numeroPratica: 1,
        anno: 1,
        benestare: 1
    });
    if(pageSize && currentPage){
        queryConto.skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    queryConto.then(document =>{
        if(document){
            doc = document;
            return FTV.aggregate().lookup({
                from: 'FTV_avg',
                localField: 'numeroPratica',
                foreignField: '_id',
                as: 'avg'
            })
            .unwind('$avg')
            .addFields({
                diffPerc: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            '$benestare.Jun.value',
                            '$avg.avg.Jun.value'
                          ]
                        },
                        '$avg.avg.Jun.value'
                      ]
                    },
                    100
                  ]
                }
            })
            .match({
                diffPerc: {
                  $gt: discostamentoConto
                },
                anno: 2019
            })
            .group({
                _id: {
                  numeroPratica: '$numeroPratica',
                  anno: '$anno'
                },
                count: {
                  $sum: 1
                }
            })
            .group({
                _id: '',
                DocumentiTotali: {
                  $sum: '$count'
                }
            })
        }else
            res.status(404).json({ message: 'Benestare not found!'});
    })
    .then(num => {
        if(num){
            res.status(200).json({
                message: 'Benestare fetched succesfully!!',
                conto: { 
                    doc: doc,
                    discostamento: discostamentoConto,
                    totale: num[0].DocumentiTotali
                }
               
            });
        }else
            res.status(404).json({ message: 'Benestare not found!'});
    })
    .catch(error => {
        res.status(500).json({message: 'Getting a Totale Benestare failed!'});
    });  
}



exports.getListaScambioAnomali = (req, res, next) => {
    const pageSize = +req.body.pageSize;
    const currentPage = +req.body.currPage;
    const discostamentoScambio = +req.body.discostamento;

    let doc;
    const queryConto = Scambio.aggregate().lookup({
        from: 'ScambioSulPosto_avg',
        localField: 'numeroPratica',
        foreignField: '_id',
        as: 'avg'          
      })
      .unwind('$avg')
      .match({
        "avg.avg.1Semestre.value": {$gt: 0}
      })
      .addFields({
        diffPerc: {
          $multiply: [
            {
              $divide: [
                {
                  $subtract: [
                    '$benestare.1Semestre.value',
                    '$avg.avg.1Semestre.value'
                  ]
                },
                '$avg.avg.1Semestre.value'
              ]
            },
            10
          ]
        }        
      })
      .match({
        diffPerc: {
          $gt: discostamentoScambio
        },
        anno:2017 
      })
      .project({
        numeroPratica: 1,
        anno: 1,
        'benestare.1Semestre.value': 1      
    });
    if(pageSize && currentPage){
        queryConto.skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    queryConto.then(document =>{
        if(document){
            doc = document;
            return Scambio.aggregate().lookup({
                from: 'ScambioSulPosto_avg',
                localField: 'numeroPratica',
                foreignField: '_id',
                as: 'avg'          
              })
              .unwind('$avg')
              .match({
                "avg.avg.1Semestre.value": {$gt: 0}
              })
              .addFields({
                diffPerc: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            '$benestare.1Semestre.value',
                            '$avg.avg.1Semestre.value'
                          ]
                        },
                        '$avg.avg.1Semestre.value'
                      ]
                    },
                    10
                  ]
                }        
              })
              .match({
                diffPerc: {
                  $gt: discostamentoScambio
                },
                anno:2017 
              })
              .group({
                _id: {
                  numeroPratica: '$numeroPratica',
                  anno: '$anno'
                },
                count: {
                  $sum: 1
                },
            })
            .group({
                _id: '',
                DocumentiTotali: {
                  $sum: '$count'
                }
            });
        }else
            res.status(404).json({ message: 'Benestare not found!'});
    })
    .then(num => {
        if(num){
            res.status(200).json({
                message: 'Benestare fetched succesfully!!',
                conto: { 
                    doc: doc,
                    discostamento: discostamentoScambio,
                    totale: num[0].DocumentiTotali
                }
               
            });
        }else
            res.status(404).json({ message: 'Benestare not found!'});
    })
    .catch(error => {
        res.status(500).json({message: 'Getting a Totale Benestare failed!'});
    });  
}