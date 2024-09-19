import type { ChatMessage, ChatRoom } from "@prisma/client";
import jsPDF from "jspdf";

export const fetchAndDownloadPDF = (allUserCustomers: any) => {
  const doc = new jsPDF();
  const lineSpacing = 10;
  const sectionSpacing = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  allUserCustomers?.forEach((customerData: any, index: number) => {
    const {
      botType,
      chatModel,
      chatRoom,
      email,
      greetings,
      name,
      city,
      country,
    } = customerData;

    let startY = 10;

    doc.text(`Customer ${index + 1}:`, 10, startY);
    startY += lineSpacing;
    doc.text(`Name: ${name}`, 10, startY);
    startY += lineSpacing;
    doc.text(`Email: ${email}`, 10, startY);
    startY += lineSpacing;
    doc.text(`City: ${city}`, 10, startY);
    startY += lineSpacing;
    doc.text(`Country: ${country}`, 10, startY);
    startY += lineSpacing + sectionSpacing;

    doc.text(`ChatBot Type: ${botType}`, 10, startY);
    startY += lineSpacing;
    doc.text(`Chat Model: ${chatModel}`, 10, startY);
    startY += lineSpacing;
    doc.text(`Greeting: ${greetings}`, 10, startY);
    startY += lineSpacing + sectionSpacing; // Space before chat rooms

    // Iterate over chat rooms
    chatRoom.forEach((room: any, roomIndex: number) => {
      doc.text(`Chat Room ${roomIndex + 1}:`, 10, startY);
      startY += lineSpacing; // Add space after chat room title

      room?.message?.forEach((msg: ChatMessage, msgIndex: number) => {
        const { message, role, createdAt } = msg;

        // Check if adding this message will exceed the page height
        if (startY + lineSpacing * 3 > pageHeight) {
          doc.addPage(); // Add a new page if necessary
          startY = 10; // Reset Y position
        }

        // Wrap long messages
        const wrappedRole = doc.splitTextToSize(
          `Role: ${role}`,
          pageWidth - 20
        ); // 20 for margins
        const wrappedMessage = doc.splitTextToSize(
          `Message: ${message}`,
          pageWidth - 30
        ); // 30 for indent
        const wrappedTime = doc.splitTextToSize(
          `Time: ${new Date(createdAt).toLocaleString()}`,
          pageWidth - 30
        );

        // Add wrapped message details
        wrappedRole.forEach((line: any, lineIndex: any) => {
          doc.text(line, 10, startY + lineIndex * lineSpacing);
        });
        startY += wrappedRole.length * lineSpacing;

        wrappedMessage.forEach((line: any, lineIndex: any) => {
          doc.text(line, 30, startY + lineIndex * lineSpacing);
        });
        startY += wrappedMessage.length * lineSpacing;

        wrappedTime.forEach((line: any, lineIndex: any) => {
          doc.text(line, 30, startY + lineIndex * lineSpacing);
        });
        startY += wrappedTime.length * lineSpacing + sectionSpacing; // Add space after each message block
      });

      // Space between chat rooms
      startY += sectionSpacing;
    });

    // Add a new page if there's another customer
    if (index < allUserCustomers.length - 1) {
      doc.addPage();
    }
  });

  // Save the PDF to the user's machine
  doc.save("customer_data_with_spacing.pdf");
};
