import { LightningElement, wire } from 'lwc';
import { gql, graphql } from "lightning/uiGraphQLApi";


const actions = [
  { label: 'Show details', name: 'edit' },
  { label: 'Delete', name: 'delete' },
];

const columns = [
  { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Amount', fieldName: 'Amount', editable: true },
  {
    type: 'action',
    typeAttributes: { rowActions: actions },
  },
];

export default class ShowTable extends LightningElement {
  cols = columns;
  info = []


  @wire(graphql, {
    query: gql`
      query AccountWithName {
        uiapi {
          query {
            Opportunity(first: 10) {
              edges {
                node {
                  Id
                  Name {
                    value
                  }
                  Amount {
                    value
                  }
                }
              }
            }
          }
        }
      }
    `,
  })
  graphqlQueryResult({ data, errors }) {
    if (data) {
      console.log(JSON.parse(JSON.stringify(data)));
      this.info = data.uiapi.query.Opportunity.edges.map((edge) => {
        return {
          Name: edge.node.Name.value,
          Amount: edge.node.Amount.value,
          Id: edge.node.Id
        };
      });
      console.log(JSON.parse(JSON.stringify(this.info)));
    } else if (errors) {
      console.log('erros', errors)
    }
  }
}