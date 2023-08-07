// // Wait for the DOM to be ready
// document.addEventListener('DOMContentLoaded', function() {
//     // Get the header element
//     var header = document.querySelector('.md-header');
  
//     // Check the current path
//     var path = window.location.pathname;
    
//     // Fetch no-search header
//     var customContentPath = 'overrides/partials/header-no-search.html';
//     fetch(customContentPath)
//     .then(function(response) {
//       if (response.ok) {
//         return response.text();
//       } else {
//         throw new Error('Failed to fetch custom content');
//       }
//     })
//     .then(function(customContent) {
//       if (path === '/') {
//         customContent = customContent;
//       } else {
//         customContent = header.innerHTML.trim();
//       }
//       // Combine the custom content with the original header content
//       // var originalContent = header.innerHTML.trim();
//       // var updatedContent = originalContent + ' ' + customContent;
      
//       // Update the header content
//       header.innerHTML = customContent;
//     })
//     .catch(function(error) {
//       console.error(error);
//     });
// });