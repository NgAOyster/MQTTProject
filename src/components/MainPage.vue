<template>
    <div>
      <h1>Main Page</h1>
      <p>Welcome, {{ username }}!</p>
    </div>
  </template>
  
  <script>
  export default {
    props: ['username'],
  };
  </script>
  
  <style>
  /* Add your styling for the main page here */
  </style>
  