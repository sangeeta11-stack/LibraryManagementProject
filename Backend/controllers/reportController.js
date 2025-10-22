
exports.booksReport = (req, res) => res.json({ message: 'Books report' });
exports.usersReport = (req, res) => res.json({ message: 'Users report' });
exports.transactionsReport = (req, res) => res.json({ message: 'Transactions report' });
exports.renewalsReport = (req, res) => res.json({ message: 'Renewals report' });
exports.overdueFinesReport = (req, res) => res.json({ message: 'Overdue/Fines report' });


exports.reserveBook = (req, res) => res.json({ message: 'Book reserved' });


exports.issueBook = (req, res) => res.json({ message: 'Book issued' });
exports.returnBook = (req, res) => res.json({ message: 'Book returned' });
