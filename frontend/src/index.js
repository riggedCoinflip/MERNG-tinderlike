import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {ApolloClient, InMemoryCache} from '@apollo/client';
import {ApolloProvider} from '@apollo/client/react';
import './main.scss';
import App from './App';
import { onError } from 'apollo-link-error';

const client = new ApolloClient({
    uri: process.env.REACT_APP_HOST,
     
    defaultOptions : {
      watchQuery: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    
    
    cache: new InMemoryCache({
      typePolicies: {
        User: {
          keyFields: ["email"],
        }
      },
    }),
    
    onError: ({ networkError, graphQLErrors }) => {
        console.log('graphQLErrors', graphQLErrors)
        console.log('networkError', networkError)

}});
const link = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });
  
render(
    <Router>
        <ApolloProvider client={client}>
            <App/>
        </ApolloProvider>
    </Router>,
    document.getElementById('root')
);

