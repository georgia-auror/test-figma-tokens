module.exports = {
  filter: {
    mainTokens: function(token) {
        return token.attributes.category !== 'colors' && token.attributes.category !== 'fontSizes'
    }
  },
  format: {
    formatJsWithReferences: function({dictionary, options}) {
      return dictionary.allTokens.map(token => {
        let value = JSON.stringify(token.value);

        if (options.outputReferences) {
          if (dictionary.usesReference(token.original.value)) {
            const refs = dictionary.getReferences(token.original.value);
            if (refs.length === 1) {
              value = refs[0].name;
            } else {
              refs.forEach(ref => {
                value = value.replace(ref.value, function() {
                  return `\$\{${ref.name}\}`;
                });
              });
              // Use backticks for string interpolation
              value = value.replaceAll('"', '`');
            }
          }
        }

        return `export const ${token.name} = ${value};`
      }).join(`\n`)
    },
    formatForTailwind: function({dictionary, options}) {
      let obj = {};
      let outputString = '';
      dictionary.allTokens.map(token => {
        const { attributes, value } = token;
        const category = attributes.category;
        const type = attributes.type?.replace("-", "");
        const hasItem = !!attributes.item;

        if (options.ignoreRoot) {
          obj = {
            ...obj,
            ...(hasItem 
              ? { [type]: { ...obj[type], [attributes.item]: value }} 
              : { [type]: value }
            )
          };
        } else {
          obj = { ...obj, 
            [category]: {
              ...obj[category],
              ...(hasItem 
                ? { [type]: { ...obj[category][type], [attributes.item]: value }} 
                : { [type]: value }
              ),
            }
          };
        }

        const output = JSON.stringify(obj, null, 2);
        outputString = output.replace(/"([^"]+)":/g, '$1:');

        // if (options.outputReferences) {
        //   if (dictionary.usesReference(token.original.value)) {
        //     const refs = dictionary.getReferences(token.original.value);
        //     if (refs.length === 1) {
        //       value = refs[0].name;
        //     } else {
        //       refs.forEach(ref => {
        //         value = value.replace(ref.value, function() {
        //           return `\$\{${ref.name}\}`;
        //         });
        //       });
        //       // Use backticks for string interpolation
        //       value = value.replaceAll('"', '`');
        //     }
        //   }
        // }
      
      });
      // Consider adding typings here as well
      return `export const ${options.tokenSetName} = ${outputString}`;
    }
  },
  source: ["src/theme/rawTokens/**/*.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "src/theme/",
      files: [{
        destination: "variables.scss",
        format: "scss/variables",
        options: {
          outputReferences: true
        }
      }]
    },
    js: {
      transforms: ['attribute/cti', 'name/cti/constant', 'size/px', 'color/hex',],
      buildPath: "src/theme/tokens/",
      files: [{
        destination: "constants.js",
        format: 'formatJsWithReferences',
        options: {
          outputReferences: true
        }
      }]
    },
    tailwind: {
      transformGroup: "js",
      buildPath: "src/theme/tokens/",
      files: [
        {
          destination: "tokens.js",
          format: "formatForTailwind",
          filter: "mainTokens",
          options: {
            tokenSetName: 'tokens'
          }
        },
        {
          destination: "colors.js",
          format: "formatForTailwind",
          filter: {
            attributes: {
              category: 'colors'
            }
          },
          options: {
            ignoreRoot: true,
            tokenSetName: 'colors'
          }
        },
        {
          destination: "topography.js",
          format: "formatForTailwind",
          filter: {
            attributes: {
              category: 'fontSizes'
            }
          },
          options: {
            ignoreRoot: true,
            tokenSetName: 'fontSizes'
          }
        }
      ]
    },
  }
}