declare module 'html-pdf-node' {
  interface Options {
    format?: string;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  }
  
  interface FileObject {
    content: string;
  }
  
  function generatePdf(file: FileObject, options?: Options): Promise<Buffer>;
  
  export default {
    generatePdf
  };
}