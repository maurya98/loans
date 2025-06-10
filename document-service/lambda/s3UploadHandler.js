const AWS = require('aws-sdk');

exports.handler = async (event) => {
    try {
        // Log the event for debugging
        console.log('Received event:', JSON.stringify(event, null, 2));

        // Get the S3 bucket and object details from the event
        const s3 = event.Records[0].s3;
        const bucketName = s3.bucket.name;
        const objectKey = decodeURIComponent(s3.object.key.replace(/\+/g, ' '));

        // Get metadata from the S3 object
        const s3Client = new AWS.S3();
        const metadata = await s3Client.headObject({
            Bucket: bucketName,
            Key: objectKey
        }).promise();

        // Extract custom metadata if it exists
        const callbackUrl = metadata.Metadata['callback-url'];
        const documentId = metadata.Metadata['document-id'];

        // If there's a callback URL, make a POST request to notify about the upload
        if (callbackUrl) {
            const https = require('https');
            const url = new URL(callbackUrl);
            
            const postData = JSON.stringify({
                documentId: documentId,
                bucketName: bucketName,
                objectKey: objectKey,
                eventType: 'UPLOAD_COMPLETED',
                timestamp: new Date().toISOString()
            });

            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };

            // Make the callback request
            await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        console.log('Callback response:', data);
                        resolve();
                    });
                });

                req.on('error', (error) => {
                    console.error('Callback error:', error);
                    reject(error);
                });

                req.write(postData);
                req.end();
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'S3 upload processed successfully',
                documentId: documentId,
                objectKey: objectKey
            })
        };
    } catch (error) {
        console.error('Error processing S3 upload:', error);
        throw error;
    }
}; 