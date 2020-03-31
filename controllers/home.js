const FTV = require('../models/benFTV');
const Scambio = require('../models/scambio');


exports.getTotale = (req, res, next) => {
  let totConto;
  let totScambio;
  let numConto;
  FTV.aggregate().lookup({
      from: 'ContoEnergia_avg',
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
    anno:2019
  })
  .group({
      _id: {
        numeroPratica: '$numeroPratica',
        anno: '$anno'
      },
      count: {
        $sum: 1
      },
      total: {
        $sum: '$benestare.Jun.value'
      } 
  })
  .group({
      _id: '',
      DocumentiTotali: {
        $sum: '$count'
      },
      BenestareTotali: {
        $sum: '$total'
      }
  })
  .then(document =>{
      if(document){
        totConto = document
        return Scambio.aggregate().lookup({
          from: 'ScambioSulPosto_avg',
          localField: 'numeroPratica',
          foreignField: '_id',
          as: 'avg'          
        })
        .unwind('$avg')
        // .match({
        //   "avg.avg.1Semestre.value": {$gt: 0}
        // })
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
              1
            ]
          }        
        })
        .match({
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
          total: {
            $sum: '$benestare.1Semestre.value'
          } 
        })
        .group({
            _id: '',
            DocumentiTotali: {
              $sum: '$count'
            },
            BenestareTotali: {
              $sum: '$total'
            }
        });
      }else
          res.status(404).json({ message: 'Benestare not found!'});
  })
  .then(document => {
    if(document){
      totScambio = document;
      return FTV.aggregate()
        .addFields({
          valEconomico: {
            $reduce:{
              input:{
                $objectToArray: '$benestare'
              },
              initialValue: 0,
              in: { $sum: [ "$$value", "$$this.v.value" ] }
            }
          }
        })
        .group({
          _id: {
            numeroPratica: '$numeroPratica'
          },
          count: {$sum:1},
          totEconomico: {$sum:'$valEconomico'}
        })
        .group({
            _id: '',
            totaleDocumenti: {
              $sum: '$count'
            },
            totaleEconomico: {
              $sum: '$totEconomico'
            }
        });
    }else
        res.status(404).json({ message: 'Benestare not found!'});
  }).then(document => {
    if(document){
      numConto = document;
      return Scambio.aggregate()
      .addFields({
        valEconomico: {
          $reduce:{
            input:{
              $objectToArray: '$benestare'
            },
            initialValue: 0,
            in: { $sum: [ "$$value", "$$this.v.value" ] }
          }
        }
      })
      .group({
        _id: {
          numeroPratica: '$numeroPratica'
        },
        count: {$sum:1},
        totEconomico: {$sum:'$valEconomico'}
      })
      .group({
          _id: '',
          totaleDocumenti: {
            $sum: '$count'
          },
          totaleEconomico: {
            $sum: '$totEconomico'
          }
      });
    }else
        res.status(404).json({ message: 'Benestare not found!'});
  }).then(document => {
    if(document){
        res.status(200).json({
            message: 'Benestare fetched succesfully!!',
            conto: totConto,
            scambio: totScambio,
            numConto: numConto,
            numScambio: document
        });
    }else
        res.status(404).json({ message: 'Benestare not found!'});
  })
  .catch(error => {
      res.status(500).json({message: 'Getting a Totale Benestare failed!'});
  });  
}

exports.getTotaleAnomali = (req, res, next) => {
    const discostamentoConto = +req.params.conto;
    const discostamentoScambio = +req.params.scambio;
    let docContoEnergia;
    FTV.aggregate().lookup({
        from: 'ContoEnergia_avg',
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
        anno:2019
    })
    .group({
        _id: {
          numeroPratica: '$numeroPratica',
          anno: '$anno'
        },
        count: {
          $sum: 1
        },
        total: {
          $sum: '$benestare.Jun.value'
        } 
    })
    .group({
        _id: '',
        DocumentiTotali: {
          $sum: '$count'
        },
        BenestareTotali: {
          $sum: '$total'
        }
    })
    .then(document =>{
        if(document){
          docContoEnergia = document;
          return Scambio.aggregate().lookup({
            from: 'ScambioSulPosto_avg',
            localField: 'numeroPratica',
            foreignField: '_id',
            as: 'avg'          
          })
          .unwind('$avg')
          // .match({
          //   "avg.avg.1Semestre.value": {$gt: 0}
          // })
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
            total: {
              $sum: '$benestare.1Semestre.value'
            } 
        })
        .group({
            _id: '',
            DocumentiTotali: {
              $sum: '$count'
            },
            BenestareTotali: {
              $sum: '$total'
            }
        });
        }else
            res.status(404).json({ message: 'Benestare not found!'});
    }).then(document => {
      if(document){
          res.status(200).json({
              message: 'Benestare fetched succesfully!!',
              conto: { 
                  doc: docContoEnergia,
                  discostamento: discostamentoConto
              },
              scambio: { 
                  doc: document,
                  discostamento: discostamentoScambio
              },
          });
      }else
          res.status(404).json({ message: 'Benestare not found!'});
    })
    .catch(error => {
        res.status(500).json({message: error});
    });  
}

exports.getAnomali = (req, res, next) => {
  const tipo = +req.body.tipo;
  const discostamento = +req.body.discostamento;

  contoQuery(tipo, discostamento)
  .then(document => {
    if(document){
        res.status(200).json({
            message: 'Benestare fetched succesfully!!',
            res: { 
                doc: document,
                discostamento: discostamento
            }
        });
    }else
        res.status(404).json({ message: 'Benestare not found!'});
  })
  .catch(error => {
      res.status(500).json({message: error});
  });  
}


const contoQuery = (tipo, discostamento) => {
  if(tipo == 1){
    return FTV.aggregate().lookup({
        from: 'ContoEnergia_avg',
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
            $gt: discostamento
          },
          anno:2019
      })
      .group({
          _id: {
            numeroPratica: '$numeroPratica',
            anno: '$anno'
          },
          count: {
            $sum: 1
          },
          total: {
            $sum: '$benestare.Jun.value'
          } 
      })
      .group({
          _id: '',
          DocumentiTotali: {
            $sum: '$count'
          },
          BenestareTotali: {
            $sum: '$total'
          }
      });
  }
  else{
    return Scambio.aggregate().lookup({
      from: 'ScambioSulPosto_avg',
      localField: 'numeroPratica',
      foreignField: '_id',
      as: 'avg'          
      })
      .unwind('$avg')
      // .match({
      //   "avg.avg.1Semestre.value": {$gt: 0}
      // })
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
          $gt: discostamento
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
        total: {
          $sum: '$benestare.1Semestre.value'
        } 
    })
    .group({
        _id: '',
        DocumentiTotali: {
          $sum: '$count'
        },
        BenestareTotali: {
          $sum: '$total'
        }
    });
  }
}