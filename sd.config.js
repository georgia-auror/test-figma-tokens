module.exports = {
  filter: {
    primitives: function(token) {
        return token.attributes.type !== 'color';
    }
  }, 
  // Some hacky functions for formatting output files
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
        // If using a single file source, category should indicate separate files of outputs. E.g. primitive vs semantic token sets
        const category = attributes.category;
        const type = attributes.type?.replace("-", "");
        const item = attributes.item;
        const subItem = attributes.subitem;

        // Do something tidier here
        if (options.ignoreRoot) {
          obj = {
            ...obj,
            ...(!!item && !!subItem
              ? { 
                [item]: { 
                  ...obj[item], 
                  [subItem]: value 
                }
              }
              : { 
                [item]: value 
              }
            )
          };
        } else {
          obj = {
            ...obj,
            ...(!!item && !!subItem
              ? { 
                [type]: { 
                  ...obj[type], 
                  [item]: { 
                    ...obj[type]?.[item], 
                    [subItem]: value 
                  } 
                }
              }
              : !!item 
              ? {
                [type]: { 
                  ...obj[type], 
                  [item]: value 
                }
              } 
              : { 
                [type]: value 
              }
            )
          };
        }
        // Not using category in single file input source
        // } else {
        //   obj = { ...obj, 
        //     [category]: {
        //       ...obj[category],
        //       ...(!!item 
        //         ? { [type]: { ...obj[category]?.[type], [attributes.item]: value }} 
        //         : { [type]: value }
        //       ),
        //     }
        //   };
        // }

        const output = JSON.stringify(obj, null, 2);
        outputString = output.replace(/"([^"]+)":/g, '$1:');

        // TODO add support for references
      });
      // TODO Consider adding typings here as well
      return `export const ${options.tokenSetName} = ${outputString}`;
    }
  },
  source: ["src/theme/rawTokens/**/*.json"],
  platforms: {
    scss: {
      transformGroup: 'scss',
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
      transforms: ['attribute/cti', 'name/ti/constant', 'size/px', 'color/hex',],
      buildPath: "src/theme/tokens/",
      files: [
        {
          destination: "tokens.js",
          format: "formatForTailwind",
          filter: "primitives",
          options: {
            tokenSetName: 'tokens'
          }
        },
        {
          destination: "colors.js",
          format: "formatForTailwind",
          filter: {
            type: 'color'
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